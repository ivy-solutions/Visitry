/**
 * Created by sarahcoletti on 12/7/16.
 */
import { Notification, NotificationStatus } from '/model/notifications'
import { Visit } from '/model/visits'
import { Agency } from '/model/agencies'
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
    var msgTitle = "Visit scheduled";
    var user = User.findOne(this.userId);
    var msgText = "Visit scheduled for " + formattedVisitTime(visit) + " by " + user.fullName;
    if (visit.visitorNotes) {
      msgText += ', saying, "' + visit.visitorNotes + '"';
    }
    msgText += ".";

    var visitScheduledNotification = new Notification({
        visitId: visit._id,
        notifyDate: new Date(), toUserId: visit.requesterId, status: NotificationStatus.SENT,
        title: msgTitle, text: msgText
      }
    ).save();
    sendPushNotificationNow(visitScheduledNotification );

    var oneHourBeforeVisit = moment(visit.visitTime).add(-60, 'm').toDate();
    var dayOfVisitNotificationForRequester = new Notification({
        visitId: visit._id,
        notifyDate: oneHourBeforeVisit, toUserId: visit.requesterId, status: NotificationStatus.FUTURE,
        title: "Visit today", text: "Visit today, " + formattedVisitTime(visit) + ", with " + user.fullName
      }
    ).save();
    console.log(dayOfVisitNotificationForRequester)
    addFutureNotificationTask(dayOfVisitNotificationForRequester);

    var dayOfVisitNotificationForVisitor = new Notification({
        visitId: visit._id,
        notifyDate: oneHourBeforeVisit, toUserId: visit.visitorId, status: NotificationStatus.FUTURE,
        title: "Visit today", text: "Visit today, " + formattedVisitTime(visit) + ", with " + user.fullName
      }
    ).save();
    addFutureNotificationTask(dayOfVisitNotificationForVisitor);

  },
  'notifications.visitCancelled'(visit) {
    if (visit.visitorId && visit.visitorId !== this.userId ) {
      //communicate with visitor
      var msgTitle = "Cancelled";
      var user = User.findOne(this.userId);
      var msgText = "Visit on " + moment(visit.requestDate).local().format('MMM. D') +" cancelled by " + user.userData.firstName + ".";

      var visitCancelledNotification = new Notification({
          visitId: visit._id,
          notifyDate: new Date(), toUserId: visit.visitorId, status: NotificationStatus.SENT,
          title: msgTitle, text: msgText
        }
      ).save();
      sendPushNotificationNow( visitCancelledNotification );
    }
    if ( visit.visitorId === this.userId){
      var user = User.findOne(this.userId);
      var msgText = "Visit on " + formattedVisitTime(visit) + " cancelled by " + user.fullName + ".";
      var msgTitle = "Visit cancelled";

       var visitCancelledNotification = new Notification({
          visitId: visit._id,
          notifyDate: new Date(), toUserId: visit.requesterId, status: NotificationStatus.SENT,
          title: msgTitle, text: msgText
        }
      ).save();
      sendPushNotificationNow(visitCancelledNotification );
    }
    var futureNotifications = Notification.find({visitId: visit._id, status: NotificationStatus.FUTURE});
    futureNotifications.forEach((notification)=> {
      notification.remove();
    });
  }
});

sendPushNotificationNow = function(notification) {
  var sentNotification = Notification.findOne(notification);
  Meteor.call('userNotification', sentNotification.title, sentNotification.text, sentNotification.toUserId);
  logger.info( "notification.send " + sentNotification.text);
  sentNotification.status = NotificationStatus.SENT;
  sentNotification.save();
};

formattedVisitTime = function(visit) {
  var agency = Agency.findOne({_id:visit.agencyId}, {timeZone: 1});
  var timeZone = 'America/New_York'; //default
  if ( agency && agency.timeZone) {
    timeZone = agency.timeZone
  }
  var time = moment.tz(visit.visitTime, timeZone).format('MMM. D, h:mm');
  return time;
};
