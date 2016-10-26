import { logger } from '/server/logging'

Meteor.startup(function () {
  //the cert info is taken form the .build/deployment/settings but we set some defaults here

  var cert = Meteor.settings.apnCert ? Meteor.settings.apnCert : "VisitryPush.pem";
  var isProduction = Meteor.settings.isProduction ? true : false;
  logger.info( "Push isProduction:" + isProduction + " cert:" + cert);

  Push.debug = true;

  Push.Configure({
    apn: {
      certData: Assets.getText(cert),
      keyData: Assets.getText('SCVisitryDevKey.pem'),
      passphrase: 'Visitry99',
      production: isProduction
    },
    "gcm": {
      "apiKey": "AIzaSyBw6Y5Amshc_i8V8rcbffIo4WNdsrYF4nM",
      "projectNumber": "822210685703"
    },
  });
});