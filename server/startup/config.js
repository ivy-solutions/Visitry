import { Accounts } from 'meteor/accounts-base'
import { SSR } from 'meteor/meteorhacks:ssr';

Meteor.startup(function () {
  if (Meteor.settings.smtp) {
    process.env.MAIL_URL = Meteor.settings.smtp;

    Accounts.emailTemplates.siteName = "visitry.org";
    Accounts.emailTemplates.from = "Visitry Admin <admin@visitry.org>";
    Accounts.emailTemplates.enrollAccount.subject = function (user) {
      return "Welcome to Visitry, " + user.userData.firstName;
    };
    SSR.compileTemplate('enrollAccountTemplate',Assets.getText('enroll-account-email.html'));
    Accounts.emailTemplates.enrollAccount.html = function (user, url) {
      return SSR.render('enrollAccountTemplate',{user:user,url:url})
    }
/*    Accounts.emailTemplates.enrollAccount.text = function (user, url) {
      return "You have been selected to participate in building a better future!"
        + " To activate your account, simply click the link below:\n\n"
        + url;
    };*/
    Accounts.emailTemplates.resetPassword.from = function () {
      // Overrides value set in Accounts.emailTemplates.from when resetting passwords
      return "Visitry Password Reset <no-reply@visitry.org>";
    };
    Accounts.emailTemplates.resetPassword.text = function (user, url) {
      return "Hello,\n\n"
        + " To reset your password, simply click the link below:\n\n"
        + url + "\n\n"
        + "If you continue to have difficulty signing in to your Visitry.org account, please contact "
        + "mailto:admin@visitry.org ."
    };
  }
});