/**
 * Created by sarahcoletti on 12/8/16.
 */
import { Notification, NotificationStatus } from '/model/notifications'

Meteor.startup(function() {

  SyncedCron.start();
  SyncedCron.add({
    name: 'sendFutureNotifications',
    schedule: function (parser) {
      return parser.recur().every(1).hour();
    },
    job: function () {
      Notification.find({status: NotificationStatus.FUTURE}).forEach(function (pendingNotification) {
        if (pendingNotification.notifyDate < new Date()) {
          sendPushNotificationNow(pendingNotification._id)
        }
      });
    }
  });
});


