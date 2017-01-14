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
    SSR.compileTemplate('enrollAccountTemplate', Assets.getText('emails/enroll-account-email.html'));
    Accounts.emailTemplates.enrollAccount.html = function (user, url) {
      return SSR.render('enrollAccountTemplate', {user: user, url: url, absoluteUrl: Meteor.absoluteUrl()});
    };
    Accounts.emailTemplates.resetPassword.from = function () {
      return "Visitry Password Reset <no-reply@visitry.org>";
    };
    SSR.compileTemplate('resetPasswordTemplate',Assets.getText('emails/reset-password-email.html'));
    Accounts.emailTemplates.resetPassword.html = function (user, url) {
      return SSR.render('resetPasswordTemplate',{user:user,url:url,absoluteUrl:Meteor.absoluteUrl()});
    };
  }
});