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

  SyncedCron.add({
    name: 'sendFeedbackReminders',
    schedule: function(parser) {
      return parser.recur().on(17).hour();
    },
    job: function() {
      Meteor.call('notifications.feedbackReminders');
      return;
    }
  });

  SyncedCron.add({
    name: 'inactivityReminder',
    schedule: function(parser) {
      return parser.recur().on(12).hour();
    },
    job: function() {
      Meteor.call('notifications.useAppReminder');
      return;
    }
  });

});


