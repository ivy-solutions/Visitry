import { softremove } from 'meteor/jagi:astronomy-softremove-behavior'
import { Visit,Visits } from '/model/visits'
import { User } from '/model/users'

Meteor.publish("visits", function (options) {
  var user = Meteor.users.findOne(this.userId, {fields: {'userData.agencyIds': 1}});
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  // active future visit requests, or past requests for which feedback is needed
  var agencies = user && user.userData && user.userData.agencyIds ? user.userData.agencyIds : [];
  return Visits.find({
    agencyId: {$in: agencies},
    inactive: {$exists: false},
    $or: [
      {
        visitTime: {$lt: new Date()},
        $or: [{requesterId: this.userId, requesterFeedbackId: null},
          {visitorId: this.userId, visitorFeedbackId: null}]
      },
      {requestedDate: {$gt: today}}]
  }, options);
});

Meteor.publish("userRequests", function (options) {
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  //active requests requested by me for a future date, or for a past date and needing my feedback
  var userRequests = Visits.find({
    requesterId: {$eq: this.userId},
    inactive: {$exists: false},
    $or: [
      {visitTime: {$lt: new Date()},requesterFeedbackId: null},
      {requestedDate: {$gt: today}}
      ]
  }, options);
  var visitorIds = userRequests.map(function (visitRequest) {
    return visitRequest.visitorId
  });
  return [userRequests,
    Meteor.users.find({_id: {$in: visitorIds}}, {fields: {userData: 1}})];
});

Meteor.publish("availableVisits", function () {
  if (this.userId) {
    const defaultVisitRange = 3000;
    const defaultLocation = {"type": "Point", "coordinates": [-71.0589, 42.3601]};  //default = Boston
    var user = Meteor.users.findOne({_id: this.userId}, {
      fields: {
        'userData.agencyIds': 1,
        'userData.location': 1,
        'userData.visitRange': 1
      }
    });
    var visitRange = user.userData.visitRange ? user.userData.visitRange : defaultVisitRange;
    var fromLocation = user.userData.location ? user.userData.location.geo : defaultLocation;
    var userAgencies = user.userData.agencyIds && user.userData.agencyIds.length > 0 ? user.userData.agencyIds : [];
    //active unfilled future visit requests
    var availableRequests = Visits.find({
      agencyId: {$in: userAgencies},
      visitorId: null,
      inactive: {$exists: false},
      requestedDate: {$gt: new Date()},
      'location.geo': {
        $near: {
          $geometry: fromLocation,
          $maxDistance: visitRange * 1609
        }
      }
    }, {
      fields: {"requesterId": 1, "requestedDate": 1, "notes": 1, "location": 1}
    });
    var requesterIds = availableRequests.map(function (visit) {
      return visit.requesterId
    });
    requesterIds.push(this.userId);
    return [availableRequests,
      Meteor.users.find({_id: {$in: requesterIds}}, {fields: {userData: 1}})];
  } else {
    this.ready();
  }
});


Meteor.methods({
  'visits.createVisit'(visit) {
    visit.requesterId = this.userId;
    var requester = Meteor.users.findOne({_id: this.userId}, {fields: {'userData.agencyIds': 1}});
    if (!requester.userData.agencyIds || requester.userData.agencyIds.length == 0) {
      throw new Meteor.Error('requires-agency', "User must be affiliated with an agency.")
    }
    visit.agencyId = requester.userData.agencyIds[0]; //requesters are associated with only 1 agency, so first one is it

    visit.save();
  },
  'visits.rescindRequest'(visitId) {
    var visit = Visit.findOne(visitId);
    if (!visit) {
      throw new Meteor.Error('not-found', 'Visit request not found.');
    }
    if (this.userId !== visit.requesterId) {
      throw new Meteor.Error('not-authorized', 'Only requester is allowed to cancel visit request.');
    }
    visit.softRemove();

    if (visit.visitorId) {
      //communicate with visitor
      var msgTitle = "Visit request cancelled";
      var user = User.findOne(this.userId);
      var msgText = user.fullName + " cancelled the visit request for " + moment(visit.requestDate).format('MMM d') + '.';

      Meteor.call('userNotification',
        msgText,
        msgTitle,
        visit.visitorId
      )
    }
  },
  'visits.cancelScheduled'(visitId) {
    const visit = Visit.findOne(visitId);
    if (!visit) {
      throw new Meteor.Error('not-found');
    }
    if (this.userId !== visit.visitorId) {
      throw new Meteor.Error('not-authorized', 'Only visitor is allowed to cancel scheduled visit.');
    }
    visit.cancelledAt = new Date();
    visit.visitorId = null;
    visit.visitTime = null;
    visit.visitorNotes = null;
    visit.save({fields: ['cancelledAt', 'visitorId', 'visitTime', 'visitorNotes']});

    var msgTitle = "Visit cancelled";
    var user = User.findOne(this.userId);
    var msgText = user.fullName + " cancelled the visit scheduled for " + moment(visit.visitTime).format('MMM. d, h:mm') + ".";

    Meteor.call('userNotification',
      msgText,
      msgTitle,
      visit.requesterId
    );
  },
  'visits.scheduleVisit'(visitId, time, notes) {
    const visit = Visit.findOne(visitId);
    if (!visit) {
      throw new Meteor.Error('not-found');
    }

    visit.visitorId = this.userId;
    visit.visitTime = time;
    visit.visitorNotes = notes;
    visit.scheduledAt = new Date();
    visit.save();

    var msgTitle = "Visit scheduled";
    var user = User.findOne(this.userId);
    var msgText = user.fullName + " scheduled a visit for " + moment(visit.visitTime).format('MMM. d, h:mm');
    if (visit.visitorNotes) {
      msgText += ', saying, "' + visit.visitorNotes + '"';
    }
    msgText += ".";

    Meteor.call('userNotification',
      msgText,
      msgTitle,
      visit.requesterId
    );
  },
  'visits.attachRequesterFeedback'(visitId, feedbackId) {
    const visit = Visit.findOne(visitId);
    if (!visit) {
      throw new Meteor.Error('not-found');
    }
    visit.requesterFeedbackId = feedbackId;
    visit.save();
  },
  'visits.attachVisitorFeedback'(visitId, feedbackId){
    const visit = Visit.findOne(visitId);
    if (!visit) {
      throw new Meteor.Error('not-found');
    }
    visit.visitorFeedbackId = feedbackId;
    visit.save();
  }
});