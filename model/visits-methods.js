/**
 * Created by sarahcoletti on 9/12/16.
 */
import { softremove } from 'meteor/jagi:astronomy-softremove-behavior'
import { Visit,Visits } from '/model/visits'
import {Roles} from 'meteor/alanning:roles'

Meteor.methods({
  'visits.createVisit'(visit) {
    if(!visit.requesterId){
      visit.requesterId = this.userId;
    }
    let requester = User.findOne({_id: visit.requesterId}, {fields: {'userData.agencyIds': 1}});
    if (!requester.userData.agencyIds || requester.userData.agencyIds.length === 0) {
      console.log("user without agency affiliation attempted to create visit request, userId: " + this.userId);
      throw new Meteor.Error('requires-agency', "You must be a member of a group to submit a request.")
    }
    visit.agencyId = requester.userData.agencyIds[0]; //requesters are associated with only 1 agency, so first one is it

    visit.save(function (err, id) {
      if (err) {
        console.log("failed to create visit. err: " + err);
        throw err;
      }else{
        Meteor.call('notifications.newVisitRequest', visit);
        if(this.userId !== visit.requesterId){
          Meteor.call('notifications.visitCreatedByAdmin',visit)
        }
        console.log("created visit for " + this.userId);
        return visit;
      }
    });

  },
  'visits.rescindRequest'(visitId) {
    var visit = Visit.findOne(visitId);
    if (!visit) {
      console.log( "visits.rescindRequest for visit not found. visitId: " + visitId + " userId: " + this.userId);
      throw new Meteor.Error('not-found', 'Visit request not found.');
    }
    let isUserAdmin = Roles.userIsInRole(this.userId,'administrator',visit.agencyId)
    if (this.userId !== visit.requesterId && !isUserAdmin) {
      console.log( "visits.rescindRequest user is not requester or admin. visitId: " + visitId + " userId: " + this.userId);
      throw new Meteor.Error('not-authorized', 'Only requester is allowed to cancel visit request.');
    }
    console.log( "rescind visit request for " + visit.requesterId);
    //notify visitor
    Meteor.call( 'notifications.visitCancelled', visit);

    visit.softRemove();

    return visit;
  },
  'visits.cancelScheduled'(visitId) {
    const visit = Visit.findOne(visitId);
    if (!visit) {
      console.log( "visits.cancelScheduled for visit not found. visitId: " + visitId + " userId: " + this.userId);
      throw new Meteor.Error('not-found');
    }
    if (this.userId !== visit.visitorId) {
      console.log( "visits.cancelScheduled user is not visitor. visitId: " + visitId + " userId: " + this.userId);
      throw new Meteor.Error('not-authorized', 'Only visitor is allowed to cancel scheduled visit.');
    }

    //notify requester, before editing the visit
    Meteor.call( 'notifications.visitCancelled', visit);

    // format msg for the push notification before the save
    var user = User.findOne(this.userId);

    visit.cancelledAt = new Date();
    visit.visitorId = null;
    visit.visitTime = null;
    visit.visitorNotes = null;
    visit.save({fields: ['cancelledAt', 'visitorId', 'visitTime', 'visitorNotes']},function(err, id) {
      if (err) {
        console.log("visits.cancelScheduled failed to update visit. err: " + err);
        throw err;
      }
    });
    console.log( "visits.cancelScheduled cancelled visitId: " + visitId + " userId: " + this.userId);

    return visit;
  },
  'visits.scheduleVisit'(visitId, time, notes) {
    const visit = Visit.findOne(visitId);
    if (!visit) {
      console.log( "visits.scheduleVisit for visit not found. visitId: " + visitId + " userId: " + this.userId);
      throw new Meteor.Error('not-found');
    }

    visit.visitorId = this.userId;
    visit.visitTime = time;
    visit.visitorNotes = notes;
    visit.scheduledAt = new Date();
    visit.save(function(err, id) {
      if (err) {
        console.log("visits.scheduleVisit failed to update visit. err: " + err);
        throw err;
      }
    });
    console.log( "visits.scheduleVisit scheduled visitId: " + visitId + " userId: " + this.userId);

    Meteor.call('notifications.visitScheduled', visit);

    return visit;
  },
  'visits.attachFeedback'(visitId, feedbackId) {
    const visit = Visit.findOne(visitId);
    if (!visit) {
      console.log( "visits.attachFeedback for visit not found. visitId: " + visitId + " userId: " + this.userId);
      throw new Meteor.Error('not-found');
    }
    if (!feedbackId) {
      console.log( "visits.attachFeedback for feedback not found: feedbackId: " + feedbackId + "visitId:" + visitId + " userId:" + this.userId);
      throw new Meteor.Error('not-found');
    }
    // the visitor must submit his own feedback
    // requester feedback may be submitted by a user acting on the requester's behalf
    if ( visit.visitorId === this.userId) {
      visit.visitorFeedbackId = feedbackId;
    } else if(visit.requesterId === this.userId){
      visit.requesterFeedbackId = feedbackId;
    }
    else{
      throw new Meteor.Error('not-authorized');
    }
    visit.save(function(err, id) {
      if (err) {
        console.log("visits.attachFeedback failed to update visit. err: " + err);
        throw err;
      }
    });
    console.log( "visits.attachFeedback visitId: " + visitId + " userId: " + this.userId);
    return visit;
  }
});
