import { Accounts } from 'meteor/accounts-base'
import { SSR } from 'meteor/meteorhacks:ssr';

Meteor.startup(function () {
  if (Meteor.settings.smtp) {
    process.env.MAIL_URL = Meteor.settings.smtp;
  }

  Accounts.emailTemplates.siteName = "Visitry";
  Accounts.emailTemplates.from = "Visitry Admin <admin@visitry.org>";

  //enroll-account
  Accounts.emailTemplates.enrollAccount.subject = function (user) {
    return "Welcome to Visitry, " + user.userData.firstName;
  };
  SSR.compileTemplate('enrollAccountTemplate', Assets.getText('emails/enroll-account-email.html'));
  Accounts.emailTemplates.enrollAccount.html = function (user, url) {
    return SSR.render('enrollAccountTemplate', {user: user, url: url, absoluteUrl: Meteor.absoluteUrl()});
  };
  //reset-password
  Accounts.urls.resetPassword = (token) => {
    return Meteor.absoluteUrl('replace-password/' + token);
  };
  Accounts.emailTemplates.resetPassword.from = function () {
    return "Visitry Password Reset <no-reply@visitry.org>";
  };
  SSR.compileTemplate('resetPasswordTemplate',Assets.getText('emails/reset-password-email.html'));
  Accounts.emailTemplates.resetPassword.html = function (user, url) {
    return SSR.render('resetPasswordTemplate',{user:user,url:url,absoluteUrl:Meteor.absoluteUrl()});
  };

  //verify-email
  Accounts.urls.verifyEmail = (token) => {
    return Meteor.absoluteUrl('verify-email/' + token);
  };
  SSR.compileTemplate('verifyEmailTemplate',Assets.getText('emails/verify-email.html'));
  Accounts.emailTemplates.verifyEmail.html = function (user, url) {
    return SSR.render('verifyEmailTemplate',{user:user,url:url,absoluteUrl:Meteor.absoluteUrl()});
  };
});