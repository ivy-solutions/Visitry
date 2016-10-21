/**
 * Created by sarahcoletti on 7/18/16.
 */
import { logger } from '/server/logging'

Push.debug=true;

Push.Configure({
  apn: {
    certData: Assets.getText(Meteor.settings.apnCert),
    keyData: Assets.getText('SCVisitryDevKey.pem'),
    passphrase: 'Visitry99',
    production: Meteor.settings.isProduction
  },
  "gcm": {
    "apiKey": "AIzaSyBw6Y5Amshc_i8V8rcbffIo4WNdsrYF4nM",
    "projectNumber": "822210685703"
  },
});

Push.allow({
  send: function(userId, notification) {
    return true; // Allow all users to send
  }
});

Meteor.methods({
  serverNotification: function(text,title) {
    logger.info( "serverNotification:" + text );
    Push.send({
      from: 'push',
      title: title,
      text: text,
      query: {
        // this will send to all users
      }
    });
  },
  userNotification: function(text,title,userId) {
    logger.info( "userNotification:" + text );
    Push.send({
      from: 'push',
      title: title,
      text: text,
      query: {
        userId: userId //this will send to a specific Meteor.user()._id
      }
    });
  },
  delayedUserNotification: function(text,title,userId,when) {
    logger.info( "delayedUserNotification:" + text );
    Push.send({
      from: 'push',
      title: title,
      text: text,
      query: {
        userId: userId //this will send to a specific Meteor.user()._id
      },
      delayUntil: when
    });
  },

});
