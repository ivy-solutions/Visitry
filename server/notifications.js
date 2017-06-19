/**
 * Created by sarahcoletti on 12/7/16.
 */
import { Notification, NotificationStatus } from '/model/notifications'
import { Visit } from '/model/visits'
import { Agency } from '/model/agencies'
import { Feedback } from '/model/feedback'
import { logger } from '/server/logging'

Meteor.publish("receivedNotifications", function () {
  if (this.userId) {
    logger.verbose("publish receivedNotifications to " + this.userId);
    return Notification.find({toUserId: this.userId, status: NotificationStatus.SENT},
      { limit:20, sort: {notifyDate:-1} });
  } else {
    this.ready();
  }
});

Meteor.methods({
  'notifications.visitScheduled'(visit) {
    var msgTitle = "Visit scheduled!";
    var user = User.findOne(this.userId);
    var msgText = "Visit scheduled for " + formattedVisitTime(visit) + " by " + user.fullName;
    if (visit.visitorNotes) {
      msgText += ', saying, "' + visit.visitorNotes + '"';
    }
    msgText += ".";

    new Notification({
        visitId: visit._id,
        notifyDate: new Date(), toUserId: visit.requesterId, status: NotificationStatus.SENT,
        title: msgTitle, text: msgText
      }
    ).save(function(err, id) {
      if (err) {
        logger.error(err);
      } else {
        sendPushNotificationNow(id);
      }
    });

    var twoHoursBeforeVisit = moment(visit.visitTime).add(-120, 'm').toDate();
    new Notification({
        visitId: visit._id,
        notifyDate: twoHoursBeforeVisit, toUserId: visit.requesterId, status: NotificationStatus.FUTURE,
        title: "Visit reminder", text: "Visit today, " + formattedVisitTime(visit) + ", with " + user.fullName
      }
    ).save(function(err, id) {
      if (err) {
        logger.error(err);
      }
    });

    let requester = User.findOne({_id: visit.requesterId});
    new Notification({
        visitId: visit._id,
        notifyDate: twoHoursBeforeVisit, toUserId: visit.visitorId, status: NotificationStatus.FUTURE,
        title: "Visit reminder", text: "Visit today, " + formattedVisitTime(visit) + ", with " + requester.fullName
      }
    ).save(function(err, id) {
      if (err) {
        logger.error(err);
      }
    });

  },
  'notifications.visitCancelled'(visit) {
    if (visit.visitorId && visit.visitorId !== this.userId ) {
      //communicate with visitor
      var msgTitle = "Visit canceled";
      var user = User.findOne(this.userId);
      var msgText = "Visit on " + moment(visit.requestDate).local().format('MMM. D') +" canceled by " + user.userData.firstName + ".";

      new Notification({
          visitId: visit._id,
          notifyDate: new Date(), toUserId: visit.visitorId, status: NotificationStatus.SENT,
          title: msgTitle, text: msgText
        }
      ).save(function(err, id) {
        if (err) {
          logger.error(err);
        } else {
          sendPushNotificationNow(id);
        }
      });
     }
    if ( visit.visitorId === this.userId){
      var user = User.findOne(this.userId);
      var msgText = "Visit on " + formattedVisitTime(visit) + " canceled by " + user.fullName + ".";
      var msgTitle = "Visit canceled";

      new Notification({
          visitId: visit._id,
          notifyDate: new Date(), toUserId: visit.requesterId, status: NotificationStatus.SENT,
          title: msgTitle, text: msgText
        }
      ).save(function(err, id) {
         if (err) {
           logger.error(err);
         } else {
           sendPushNotificationNow(id);
         }
      });
    }
    var futureNotifications = Notification.find({visitId: visit._id, status: NotificationStatus.FUTURE});
    futureNotifications.forEach((notification)=> {
      notification.remove();
    });
  },
  'notifications.agencyEnrolled'(newMemberId, agency) {
    var msgTitle = "Welcome to " + agency.name + "!";
    var msgText = "Application to " + agency.name + " is approved. You can begin scheduling visits!";

    new Notification({
        notifyDate: new Date(), toUserId: newMemberId, status: NotificationStatus.SENT,
        title: msgTitle, text: msgText
      }
    ).save(function (err, id) {
      if (err) {
        logger.error(err);
      } else {
        sendPushNotificationNow(id);
      }
    });
  },
  'notifications.newVisitRequest'(visit) {
    // notify visitors who requester previously rated highly of a new request
    var requester = User.findOne(this.userId);
    var msgTitle = "Visit " + requester.fullName + " again?";
    var msgText = requester.fullName + " rated a previous visit with you highly and has just made a new visit request.";

    var sixMonthsAgo = moment(new Date()).add(-6, 'M').toDate();
    let recentHighRatings = Feedback.find(
      {requesterId:this.userId,
        submitterId: this.userId,
        companionRating: {$gt: 3},
        visitRating: {$gt: 3},
        createdAt: {$gt: sixMonthsAgo}
      });
    let preferredVisitors = recentHighRatings.map( function (goodFeedback ) {
      return goodFeedback.visitorId;
    });
    let uniquePreferredVisitors = preferredVisitors.filter(function(visitorId, index, self) {
      return index == self.indexOf(visitorId);
    });
    uniquePreferredVisitors.forEach( function(visitorId) {
      new Notification({
          notifyDate: new Date(), toUserId: visitorId, status: NotificationStatus.SENT,
          title: msgTitle, text: msgText
        }
      ).save(function (err, id) {
        if (err) {
          logger.error(err);
        } else {
          sendPushNotificationNow(id);
        }
      });
    });
  },
  'notifications.feedbackReminders'() {
    logger.verbose('notifications.feedbackReminders');
    // for visits more than 24 hours ago, missing feedback, remind visitor and requester to provide feedback
    let yesterday = moment(new Date()).add(-1, 'd').toDate();
    let visitsNeedingFeedback = Visit.find({
        visitTime: {$lt: yesterday},
        visitorId: {$ne: null},
        $or: [{requesterFeedbackId: null},
          {visitorFeedbackId: null}]
      }
    );
    let msgTitle = "Please provide feedback on visit.";
    let msgText = "Feedback from your visit helps us make your future visits even better. Open Visitry and tell us how it went.";
    let usersToNotify = [];

    visitsNeedingFeedback.forEach( function (visit ) {
      if (!visit.requesterFeedbackId) {
        if (usersToNotify.indexOf(visit.requesterId) === -1) {
          usersToNotify.push(visit.requesterId)
        }
      }
      if (!visit.visitorFeedbackId) {
        if (usersToNotify.indexOf(visit.visitorId) === -1) {
          usersToNotify.push(visit.visitorId)
        }
      }
    });

    logger.verbose("feedback reminders to:" + usersToNotify);

    usersToNotify.forEach( function(memberId) {
      new Notification({
          notifyDate: new Date(), toUserId: memberId, status: NotificationStatus.SENT,
          title: msgTitle, text: msgText
        }
      ).save(function (err, id) {
        if (err) {
          logger.error(err);
        } else {
          sendPushNotificationNow(id);
        }
      });
    });
  },
  'notifications.useAppReminder'() {
    // if no Notification are scheduled or have been sent in the last 7 days, then user has gone inactive
    // nudge visitors to use app if there are pending visit requests
    logger.verbose('notifications.useAppReminder');
    let sevenDaysAgo = moment(new Date()).add(-7, 'd').toDate();
    let usersWithRecentOrFutureNotifications = Notification.find({ notifyDate: {$gt: sevenDaysAgo}});
    let activeUsers = [];
    usersWithRecentOrFutureNotifications.forEach( function (notification ) {
      if (activeUsers.indexOf(notification.toUserId) === -1) {
        activeUsers.push(notification.toUserId);
      }
    });

    let pendingRequests = Visit.find({requestedDate: {$gt: new Date()}, visitTime: null});
    let agenciesWithPendingRequests = [];
    pendingRequests.forEach( function(visit) {
      if (agenciesWithPendingRequests.indexOf(visit.agencyId) === -1) {
        agenciesWithPendingRequests.push(visit.agencyId);
      }
    });

    let msgTitle = "Brighten the week with a visit!";
    let msgText1 = "Visit requests are available at ";
    let msgText2 = " Use Visitry to schedule a visit.";

    agenciesWithPendingRequests.forEach( function( agencyId ) {
      var selector = {_id: {$nin:activeUsers }};
      selector['roles.' + agencyId] = 'visitor';
      let inactiveVisitors = User.find(selector);

      inactiveVisitors.forEach(function (user) {
        let agency = Agency.findOne({_id: agencyId});
        new Notification({
            notifyDate: new Date(), toUserId: user._id, status: NotificationStatus.SENT,
            title: msgTitle, text: (msgText1 + agency.name + msgText2)
          }
        ).save(function (err, id) {
          if (err) {
            logger.error(err);
          } else {
            sendPushNotificationNow(id);
          }
        });
      });
    });
}
});

sendPushNotificationNow = function(notification) {
  var sentNotification = Notification.findOne(notification);
  if (sentNotification) {
    Meteor.call('userNotification', sentNotification.title, sentNotification.text, sentNotification.toUserId);
    logger.info("notification.send to " + sentNotification.toUserId);
    sentNotification.status = NotificationStatus.SENT;
    sentNotification.save(function(err,id) {
      if (err) {
        logger.error(err);
      }
    });
  } else {
    logger.error( "Notification not found: " + notification );
  }
};

formattedVisitTime = function(visit) {
  var agency = Agency.findOne({_id:visit.agencyId}, {timezone: 1});
  var timeZone = 'America/New_York'; //default
  if ( agency && agency.timezone) {
    timeZone = agency.timezone
  }
  var time = moment.tz(visit.visitTime, timeZone).format('MMM. D, h:mm');
  return time;
};

