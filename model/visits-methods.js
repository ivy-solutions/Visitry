/**
 * Created by sarahcoletti on 9/12/16.
 */
import { softremove } from 'meteor/jagi:astronomy-softremove-behavior'
import { Visit,Visits } from '/model/visits'
import { Agency } from '/model/agencies'


Meteor.methods({
  'visits.createVisit'(visit) {
    visit.requesterId = this.userId;
    var requester = Meteor.users.findOne({_id: this.userId}, {fields: {'userData.agencyIds': 1}});
    if (requester.userData.agencyIds==null || requester.userData.agencyIds.length === 0) {
      console.log("user without agency affiliation attempted to create visit request, userId: " + this.userId);
      throw new Meteor.Error('requires-agency', "User must be affiliated with an agency.")
    }
    visit.agencyId = requester.userData.agencyIds[0]; //requesters are associated with only 1 agency, so first one is it

    visit.save(function (err, id) {
      if (err) {
        console.log("failed to create visit. err: " + err);
        throw err;
      }
    });
    console.log("created visit for " + this.userId);
    return visit;
  },
  'visits.rescindRequest'(visitId) {
    var visit = Visit.findOne(visitId);
    if (!visit) {
      console.log( "visits.rescindRequest for visit not found. visitId: " + visitId + " userId: " + this.userId);
      throw new Meteor.Error('not-found', 'Visit request not found.');
    }
    if (this.userId !== visit.requesterId) {
      console.log( "visits.rescindRequest user is not requester. visitId: " + visitId + " userId: " + this.userId);
      throw new Meteor.Error('not-authorized', 'Only requester is allowed to cancel visit request.');
    }
    console.log( "rescind visit request for " + this.userId);

    if (visit.visitorId) {
      //communicate with visitor
      var msgTitle = "Cancelled";
      var user = User.findOne(this.userId);
      var msgText = "Visit on " + moment(visit.requestDate).local().format('MMM. D') +" cancelled by " + user.userData.firstName + ".";

      console.log( msgText);
      Meteor.call('userNotification',
        msgText,
        msgTitle,
        visit.visitorId
      )
    }
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

    // format msg for the push notification before the save
    var user = User.findOne(this.userId);
    var msgText = "Visit on " + formattedVisitTime(visit) + " cancelled by " + user.fullName + ".";

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

    var msgTitle = "Visit cancelled";
    console.log( msgText);

    Meteor.call('userNotification',
      msgText,
      msgTitle,
      visit.requesterId
    );
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

    var msgTitle = "Visit scheduled";
    var user = User.findOne(this.userId);
    var msgText = "Visit scheduled for " + formattedVisitTime(visit) + " by " + user.fullName;
    if (visit.visitorNotes) {
      msgText += ', saying, "' + visit.visitorNotes + '"';
    }
    msgText += ".";

    console.log( msgText);
    Meteor.call('userNotification',
      msgText,
      msgTitle,
      visit.requesterId
    );
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

formattedVisitTime = function(visit) {
  var agency = Agency.findOne({_id:visit.agencyId}, {timeZone: 1});
  var timeZone = 'America/New_York'; //default
  if ( agency && agency.timeZone) {
    timeZone = agency.timeZone
  }
  var time = moment.tz(visit.visitTime, timeZone).format('MMM. D, h:mm');
  return time;
};
