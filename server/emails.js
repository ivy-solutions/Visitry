/**
 * Created by Daniel Biales on 2/17/17.
 */

import { Meteor } from 'meteor/meteor';
import {logger} from'/server/logging';
import { SSR } from 'meteor/meteorhacks:ssr';
import {Errors} from '/server/server-errors';
import {Agency} from '/model/agencies';

let emailMethods = {
  sendAgencyWelcomeEmail: (userId, agencyId)=> {
    let user = User.findOne({_id: userId});
    let agency = Agency.findOne({_id: agencyId});
    SSR.compileTemplate('welcomeToAgency', Assets.getText('emails/welcome-to-agency-email.html'));
    try {
      Email.send({
        to: user.emails[0].address,
        from: "Visitry Admin <admin@visitry.org>",
        subject: 'Visitry: Welcome to ' + agency.name,
        html: SSR.render('welcomeToAgency', {
          user: user,
          agency: agency,
          url: 'https://visitry.org',
          absoluteUrl: Meteor.absoluteUrl()
        })
      });
    } catch (err) {
      logger.error("Failed to send email to user with username:" + user.username + " using email:" + user.emails[0].address);
      logger.error("Error sending email: " + err.message);
      throw( "Email notification failed. Error:" + err.message);
    }
  },
  sendEnrollmentEmail(userId, agencyId){
    Errors.checkUserLoggedIn(this.userId, 'sendEnrollmentEmail', 'Must be logged in to send enrollment email.');
    Errors.checkUserIsAdministrator(this.userId, agencyId, 'sendEnrollmentEmail', 'Must be an agency administrator to send enrollment email.');
    Accounts.sendEnrollmentEmail(userId);
  }
};

Meteor.methods(emailMethods);