/**
 * Created by sarahcoletti on 12/8/16.
 */
import { Notification, NotificationStatus } from '/model/notifications'

Meteor.startup(function() {

  Notification.find({status:NotificationStatus.FUTURE}).forEach(function(pendingNotification) {
    if (pendingNotification.notifyDate < new Date()) {
      sendNotification(pendingNotification)
    } else {
      addFutureNotificationTask(pendingNotification._id);
    }
  });
  SyncedCron.start();
});


function sendNotification(notification) {
  sendPushNotificationNow(notification );
}

addFutureNotificationTask = function(id) {
  var notification = Notification.findOne(id);
  SyncedCron.add({
    name: id,
    schedule: function(parser) {
      return parser.recur().on(notification.notifyDate).fullDate();
    },
    job: function() {
      sendPushNotificationNow(notification);
      SyncedCron.remove(id);
      return id;
    }
  });
}
