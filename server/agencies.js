/**
 * Created by sarahcoletti on 6/30/16.
 */
import {Agencies, Agency} from '/model/agencies'
import { logger } from '/server/logging'
import { SSR } from 'meteor/meteorhacks:ssr';
import { Roles } from 'meteor/alanning:roles'

Meteor.publish("allAgencies", function (options) {
  logger.info("publish allAgencies ");
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  // active agencies
  return Agencies.find({
    activeUntil: {$gt: today}
  }, options);
});
Meteor.publish("myAgencies", function () {
  if (this.userId) {
    logger.info("publish myAgencies ");
    var user = Meteor.users.findOne(this.userId, {fields: {'userData.agencyIds': 1}});
    // active agencies
    return Agencies.find();
  } else {
    this.ready();
  }
});

Meteor.methods({
  getAgency(agencyId)
  {
    if (!this.userId) {
      logger.error("getAgency - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in.');
    }
    logger.info("getAgency" + agencyId);
    return Agencies.findOne({_id: agencyId}, {fields: {name: 1, website: 1, location: 1, contactPhone: 1, contactEmail:1 }})
  },
  sendEmail(to, from, subject, text) {
    logger.info([to, from, subject, text]);
    Email.send({
      to: to,
      from: from,
      subject: subject,
      text: text
    });
  },
  sendJoinRequest(agencyId, userNotes) {
    Meteor.call('addProspectiveAgency', agencyId);

    var agency = Agency.findOne(agencyId);
    var to = agency.contactEmail;
    var currentUser = User.findOne(this.userId);
    var from = "Visitry Admin <admin@visitry.org>";
    var subject = "Request to join " + agency.name;
    SSR.compileTemplate('agencyRequestToJoin', Assets.getText('emails/agency-request-to-join-email.html'));
    Email.send({
      to: to,
      from: from,
      subject: subject,
      html: SSR.render('agencyRequestToJoin', {
        user: currentUser,
        userEmail: currentUser.emails[0].address,
        note: userNotes,
        agency: agency,
        url: Meteor.absoluteUrl + 'admin/manage',
        absoluteUrl: Meteor.absoluteUrl()
      })
    });
  },
  revokeJoinRequest(agencyId, userNotes) {
    Meteor.call('removeProspectiveAgency', agencyId);

    var agency = Agency.findOne(agencyId);
    var to = agency.contactEmail;
    var currentUser = User.findOne(this.userId);
    var from = "Visitry Admin <admin@visitry.org>";
    var subject = "Request to join " + agency.name + ' cancelled';
    SSR.compileTemplate('agencyRevokeRequestToJoin', Assets.getText('emails/agency-revoke-request-to-join-email.html'));
    Email.send({
      to: to,
      from: from,
      subject: subject,
      html: SSR.render('agencyRevokeRequestToJoin', {
        user: currentUser,
        userEmail: currentUser.emails[0].address,
        note: userNotes,
        agency: agency,
        url: Meteor.absoluteUrl + 'admin/manage/visitors',
        absoluteUrl: Meteor.absoluteUrl()
      })
    });
  },
  updateAgency(agencyId, modifiers){
    if (!this.userId) {
      logger.error("updateAgency - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update agency.');
    } else if (!Roles.userIsInRole(this.userId, ['administrator'])) {
      logger.error("updateAgency - user unauthorized");
      throw new Meteor.Error('unauthorized',
        'User must be an administrator to update agency.');
    } else {
      Agencies.update({_id: agencyId}, modifiers, (err)=> {
        if (err) {
          logger.error('Error updating agency: ' + agencyId + ' ' + err);
          throw err;
        } else {
          logger.verbose('Updated agency: ' + agencyId);
          return agencyId;
        }
      });
    }

  }
});

