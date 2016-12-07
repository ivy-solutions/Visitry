/**
 * Created by sarahcoletti on 12/7/16.
 */
import { Notification, NotificationStatus } from '/model/notifications'
import { Visit } from '/model/visits'
import { Agency } from '/model/agencies'
import { logger } from '/server/logging'

Meteor.methods({
  'notifications.visitScheduled'(visit) {
    var msgTitle = "Visit scheduled";
    console.log(visit)
    var user = User.findOne(this.userId);
    var msgText = "Visit scheduled for " + formattedVisitTime(visit) + " by " + user.fullName;
    if (visit.visitorNotes) {
      msgText += ', saying, "' + visit.visitorNotes + '"';
    }
    msgText += ".";

    logger.info( "notifications.visitScheduled " + msgText);
    Meteor.call('userNotification',
      msgText,
      msgTitle,
      visit.requesterId
    );

    var visitScheduledNotification = new Notification({
        visitId: visit._id,
        notifyDate: new Date(), toUserId: visit.requesterId, status: NotificationStatus.SENT,
        title: msgTitle, text: msgText
      }
    ).save();

    var oneHourBeforeVisit = moment(visit.visitTime).add(-60, 'm').toDate();
    var imminentNotificationForRequester = new Notification({
        visitId: visit._id,
        notifyDate: oneHourBeforeVisit, toUserId: visit.requesterId, status: NotificationStatus.FUTURE,
        title: "Visit today", text: "Visit today, " + formattedVisitTime(visit) + ", with " + user.fullName
      }
    ).save();
    var imminentNotificationForVisitor = new Notification({
        visitId: visit._id,
        notifyDate: oneHourBeforeVisit, toUserId: visit.visitorId, status: NotificationStatus.FUTURE,
        title: "Visit today", text: "Visit today, " + formattedVisitTime(visit) + ", with " + user.fullName
      }
    ).save();

  },
  'notifications.visitCancelled'(visit) {
    logger.info( visit );
    if (visit.visitorId && visit.visitorId !== this.userId ) {
      //communicate with visitor
      var msgTitle = "Cancelled";
      var user = User.findOne(this.userId);
      var msgText = "Visit on " + moment(visit.requestDate).local().format('MMM. D') +" cancelled by " + user.userData.firstName + ".";

      logger.info( "notifications.visitCancelled " + msgText);
      Meteor.call('userNotification',
        msgText,
        msgTitle,
        visit.visitorId
      );
      var visitCancelledNotification = new Notification({
          visitId: visit._id,
          notifyDate: new Date(), toUserId: visit.visitorId, status: NotificationStatus.SENT,
          title: msgTitle, text: msgText
        }
      ).save();
    }
    if ( visit.visitorId === this.userId){
      var user = User.findOne(this.userId);
      var msgText = "Visit on " + formattedVisitTime(visit) + " cancelled by " + user.fullName + ".";
      var msgTitle = "Visit cancelled";
      logger.info( "notifications.visitCancelled " + msgText);

      Meteor.call('userNotification',
        msgText,
        msgTitle,
        visit.requesterId
      );

      var visitCancelledNotification = new Notification({
          visitId: visit._id,
          notifyDate: new Date(), toUserId: visit.requesterId, status: NotificationStatus.SENT,
          title: msgTitle, text: msgText
        }
      ).save();
    }
    var futureNotifications = Notification.find({visitId: visit._id, status: NotificationStatus.FUTURE});
    futureNotifications.forEach((notification)=> {
      notification.remove();
    });

  }
});


formattedVisitTime = function(visit) {
  var agency = Agency.findOne({_id:visit.agencyId}, {timeZone: 1});
  var timeZone = 'America/New_York'; //default
  if ( agency && agency.timeZone) {
    timeZone = agency.timeZone
  }
  var time = moment.tz(visit.visitTime, timeZone).format('MMM. D, h:mm');
  return time;
};

