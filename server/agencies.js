/**
 * Created by sarahcoletti on 6/30/16.
 */
import {Agencies} from '/model/agencies'
import { logger } from '/server/logging'

Meteor.publish("allAgencies", function (options) {
  logger.info("publish agencies " );
  var today = new Date();
  today.setHours(0,0,0,0);
  // active agencies
  return Agencies.find({
    activeUntil: { $gt : today}
  },options);
});

Meteor.methods({
  getAgency(agencyId)
  {
    if (!this.userId) {
      logger.error("getAgency - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in.');
    }
    logger.info( "getAgency" + agencyId);
    return Agencies.findOne({_id: agencyId}, {fields: {name:1, website:1, location:1, contactPhone: 1 }})
  },
  sendEmail(to, from, subject, text) {
    logger.info([to, from, subject, text]);
    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();
    Email.send({
      to: to,
      from: from,
      subject: subject,
      text: text
    });
  }
});

