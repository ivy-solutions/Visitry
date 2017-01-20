import { softremove } from 'meteor/jagi:astronomy-softremove-behavior'
import { Visit,Visits } from '/model/visits'
import { Agency } from '/model/agencies'
import { logger } from '/server/logging'
import { Counts } from 'meteor/tmeasday:publish-counts';
import {Roles} from 'meteor/alanning:roles'

Meteor.publish("visits", function (options) {
  if (this.userId) {
    logger.verbose("publish visits to " + this.userId);
    var user = Meteor.users.findOne(this.userId, {fields: {'userData.agencyIds': 1}});
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    // active future visit requests, or past requests for which feedback is needed
    var agencies = user && user.userData && user.userData.agencyIds ? user.userData.agencyIds : [];
    let selector = {
      agencyId: {$in: agencies},
      inactive: {$exists: false},
      $or: [
        {
          visitTime: {$lt: new Date()},
          $or: [{requesterId: this.userId, requesterFeedbackId: null},
            {visitorId: this.userId, visitorFeedbackId: null}]
        },
        {requestedDate: {$gt: today}}]
    };
    Counts.publish(this, 'numberAgencyVisits', Visits.find(selector), {
      noReady: true
    });
    return Visits.find(selector);
  } else {
    this.ready();
  }
});

Meteor.publish("agencyVisits", function (agencyId, options) {
  if (this.userId) {
    logger.verbose("publish agencyVisits to " + this.userId);
    let selector = {
      agencyId: {$eq: agencyId},
      inactive: {$exists: false}
    };
    Counts.publish(this, 'numberAgencyVisits', Visits.find(selector), {
      noReady: true
    });
    var visits =  Visits.find(selector, options);
    var userIds = [];
    visits.forEach(function (visit) {
      if ( visit.visitorId ) {
        if ( userIds.indexOf(visit.visitorId)===-1) {
          userIds.push(visit.visitorId)
        }
      }
      if (userIds.indexOf(visit.requesterId)===-1) {
        userIds.push(visit.requesterId);
      }
    });

    return [visits,
      Meteor.users.find({_id: {$in: userIds}}, {fields: {'userData.firstName' : 1, 'userData.lastName': 1, 'userData.picture':1, 'userData.prospectiveAgencyIds':1}})];
  } else {
    this.ready();
  }
});

Meteor.publish("userRequests", function (userId) {
  if (this.userId && this.userId === userId) { //for now, only a requester can look at their own requests
    logger.verbose("publish userRequests of " + userId + " to " + this.userId);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    //active requests requested by me for a future date, or for a past date and needing my feedback
    var userRequests = Visits.find({
      requesterId: {$eq: userId},
      inactive: {$exists: false},
      $or: [
        {visitTime: {$lt: new Date()}, requesterFeedbackId: null},
        {requestedDate: {$gt: today}}
      ]
    });
    var visitorIds = userRequests.map(function (visitRequest) {
      return visitRequest.visitorId
    });
    return [userRequests,
      Meteor.users.find({_id: {$in: visitorIds}}, {fields: {userData: 1, emails: 1}})];
  } else {
    this.ready();
  }
});

Meteor.publish("availableVisits", function () {
  if (this.userId && Roles.userIsInRole(this.userId, 'visitor')) {
    logger.verbose("publish availableVisits to " + this.userId);
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
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    //active unfilled future visit requests
    var availableRequests = Visits.find({
      agencyId: {$in: userAgencies},
      visitorId: null,
      inactive: {$exists: false},
      requestedDate: {$gt: today},
      'location.geo': {
        $near: {
          $geometry: fromLocation,
          $maxDistance: visitRange * 1609
        }
      }
    }, {
      fields: {"requesterId": 1, "requestedDate": 1, "notes": 1, "location": 1, "agencyId": 1}
    });
    var requesterIds = availableRequests.map(function (visit) {
      return visit.requesterId
    });
    requesterIds.push(this.userId);
    return [availableRequests,
      Meteor.users.find({_id: {$in: requesterIds}}, {fields: {userData: 1, emails: 1}})];
  } else {
    this.ready();
  }
});

Meteor.methods({
  'visitorsByFrequency'(agency, numberOfDays) {
    let group = {
      _id: {
        visitorId: '$visitorId'
      },
      numVisits: {
        $sum: 1
      }
    };
    var recentVisits = Visits.aggregate(
      {
        $match: {
          'agencyId': {$eq: agency},
          'visitTime': {$exists: true, $lt: new Date(), $gt: dateByDaysBefore(numberOfDays)}
        }
      },
      {$group: group}
    );
    recentVisits.sort(function (a, b) {
      return b.numVisits - a.numVisits;
    });
    return recentVisits;
  }
});

function dateByDaysBefore(daysBefore) {
  var priorDate = new Date() - daysBefore * 24 * 3600 * 1000;
  return new Date(priorDate)
};
