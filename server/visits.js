import { softremove } from 'meteor/jagi:astronomy-softremove-behavior'
import { Visit,Visits } from '/model/visits'
import { Agency } from '/model/agencies'
import { logger } from '/server/logging'

Meteor.publish("visits", function (options) {
  if (this.userId) {
    logger.verbose("publish visits to " + this.userId);
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
  } else {
    this.ready();
  }
});

Meteor.publish("userRequests", function (options) {
  if (this.userId) {
    logger.verbose("publish userRequests to " + this.userId);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    //active requests requested by me for a future date, or for a past date and needing my feedback
    var userRequests = Visits.find({
      requesterId: {$eq: this.userId},
      inactive: {$exists: false},
      $or: [
        {visitTime: {$lt: new Date()}, requesterFeedbackId: null},
        {requestedDate: {$gt: today}}
      ]
    }, options);
    var visitorIds = userRequests.map(function (visitRequest) {
      return visitRequest.visitorId
    });
    return [userRequests,
      Meteor.users.find({_id: {$in: visitorIds}}, {fields: {userData: 1}})];
  } else {
    this.ready();
  }
});

Meteor.publish("availableVisits", function () {
  if (this.userId) {
    logger.verbose("publish availableVisits to " + this.userId );
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
      logger.warn("user without agency affiliation attempted to create visit request, userId: " + this.userId );
      throw new Meteor.Error('requires-agency', "User must be affiliated with an agency.")
    }
    visit.agencyId = requester.userData.agencyIds[0]; //requesters are associated with only 1 agency, so first one is it

    visit.save(function(err, id) {
      if (err) {
        logger.error("failed to create visit. err: " + err);
        throw err;
      }
    });
    logger.info( "created visit for " + this.userId);
    return visit;
  },
  'visits.rescindRequest'(visitId) {
    var visit = Visit.findOne(visitId);
    if (!visit) {
      logger.error( "visits.rescindRequest for visit not found. visitId: " + visitId + " userId: " + this.userId);
      throw new Meteor.Error('not-found', 'Visit request not found.');
    }
    if (this.userId !== visit.requesterId) {
      logger.error( "visits.rescindRequest user is not requester. visitId: " + visitId + " userId: " + this.userId);
      throw new Meteor.Error('not-authorized', 'Only requester is allowed to cancel visit request.');
    }
    logger.info( "rescind visit request for " + this.userId);

    if (visit.visitorId) {
      //communicate with visitor
      var msgTitle = "Visit request cancelled";
      var user = User.findOne(this.userId);
      var msgText = user.fullName + " cancelled the visit request for " + moment(visit.requestDate).local().format('ddd., MMM. D') + '.';

      logger.verbose( msgText);
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
      logger.error( "visits.cancelScheduled for visit not found. visitId: " + visitId + " userId: " + this.userId);
      throw new Meteor.Error('not-found');
    }
    if (this.userId !== visit.visitorId) {
      logger.error( "visits.cancelScheduled user is not visitor. visitId: " + visitId + " userId: " + this.userId);
      throw new Meteor.Error('not-authorized', 'Only visitor is allowed to cancel scheduled visit.');
    }

    // format msg for the push notification before the save
    var user = User.findOne(this.userId);
    var msgText = user.fullName + " cancelled the visit scheduled for " + formattedVisitTime(visit) + ".";

    visit.cancelledAt = new Date();
    visit.visitorId = null;
    visit.visitTime = null;
    visit.visitorNotes = null;
    visit.save({fields: ['cancelledAt', 'visitorId', 'visitTime', 'visitorNotes']},function(err, id) {
      if (err) {
        logger.error("visits.cancelScheduled failed to update visit. err: " + err);
        throw err;
      }
    });
    logger.info( "visits.cancelScheduled cancelled visitId: " + visitId + " userId: " + this.userId);

    var msgTitle = "Visit cancelled";
    logger.verbose( msgText);

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
      logger.error( "visits.scheduleVisit for visit not found. visitId: " + visitId + " userId: " + this.userId);
      throw new Meteor.Error('not-found');
    }

    visit.visitorId = this.userId;
    visit.visitTime = time;
    visit.visitorNotes = notes;
    visit.scheduledAt = new Date();
    visit.save(function(err, id) {
      if (err) {
        logger.error("visits.scheduleVisit failed to update visit. err: " + err);
        throw err;
      }
    });
    logger.info( "visits.scheduleVisit scheduled visitId: " + visitId + " userId: " + this.userId);

    var msgTitle = "Visit scheduled";
    var user = User.findOne(this.userId);
    var msgText = user.fullName + " scheduled a visit for " + formattedVisitTime(visit);
    if (visit.visitorNotes) {
      msgText += ', saying, "' + visit.visitorNotes + '"';
    }
    msgText += ".";

    logger.verbose( msgText);
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
      logger.error( "visits.attachFeedback for visit not found. visitId: " + visitId + " userId: " + this.userId);
      throw new Meteor.Error('not-found');
    }
    if (!feedbackId) {
      logger.error( "visits.attachFeedback for feedback not found: feedbackId: " + feedbackId + "visitId:" + visitId + " userId:" + this.userId);
      throw new Meteor.Error('not-found');
    }
    // the visitor must submit his own feedback
    // requester feedback may be submitted by a user acting on the requester's behalf
    if ( visit.visitorId == this.userId) {
      visit.visitorFeedbackId = feedbackId;
    } else {
      visit.requesterFeedbackId = feedbackId;
    }
    visit.save(function(err, id) {
      if (err) {
        logger.error("visits.attachFeedback failed to update visit. err: " + err);
        throw err;
      }
    });
    logger.info( "visits.attachFeedback visitId: " + visitId + " userId: " + this.userId);
    return visit;
  }
});

formattedVisitTime = function(visit) {
  var agency = Agency.findOne({_id:visit.agencyId}, {timeZone: 1});
  var timeZone = 'America/New_York'; //default
  if ( agency && agency.timeZone) {
    timeZone = agency.timeZone
  }
  var time = moment.tz(visit.visitTime, timeZone).format('ddd., MMM. D, h:mm');
  return time;
};
