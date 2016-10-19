/**
 * Created by sarahcoletti on 7/18/16.
 */
import { logger } from '/server/logging'

Push.debug=true;

Push.Configure({
  apn: {
    certData: Assets.getText('VisitryPush.pem'),
    keyData: Assets.getText('SCVisitryDevKey.pem'),
    passphrase: 'Visitry99',
    production: true,
    //gateway: 'gateway.push.apple.com'
  },
  "apn-dev": {
    certData: Assets.getText('VisitryPush.pem'),
    keyData: Assets.getText('SCVisitryDevKey.pem'),
    passphrase: 'Visitry99',
    production: false,
    //gateway: 'gateway.push.apple.com'
  },
  "gcm": {
    "apiKey": "AIzaSyCBf3yJEp6ZiUE4CKllsLkwsneI3_K1BzY"
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
      payload: {
        title: title,
        text:text
      },
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
      payload: {
        title: title,
        text:text
      },
      query: {
        userId: userId //this will send to a specific Meteor.user()._id
      }
    });
  }
});
