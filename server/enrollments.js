/**
 * Created by sarahcoletti on 4/5/17.
 */
import { logger } from '/server/logging'
import { Enrollment } from '/model/enrollment'

Meteor.publish("applicants", function (agencyId) {
  if (this.userId) {
    logger.verbose("publish applicants to " + this.userId);
    Counts.publish(this, 'numberOfApplicants', Enrollment.find({agencyId: agencyId, approvalDate: null}), {
      noReady: true
    });
    return Enrollment.find({agencyId:agencyId, approvalDate: null });
  } else {
    this.ready();
  }
});

Meteor.publish("memberships", function (userId) {
  if (this.userId) {
    logger.verbose("publish memberships to " + this.userId);
    return Enrollment.find({userId: userId});
  } else {
    this.ready();
  }
});

Meteor.publish("members", function (agencyId) {
  if (this.userId) {
    logger.verbose("publish members to " + this.userId);
    return Enrollment.find({agencyId:agencyId, approvalDate: { $ne: null }});
  } else {
    this.ready();
  }
});
