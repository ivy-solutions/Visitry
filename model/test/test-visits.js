/**
 * Created by n0235626 on 9/1/16.
 */
import { Random } from 'meteor/random';

var TestVisits = {
  createFutureBostonNonScheduledVisit: createFutureBostonNonScheduledVisit,
  createPastBostonNonScheduledVisit: createPastBostonNonScheduledVisit,
  createPastBostonVisitRequesterFeedback: createPastBostonVisitRequesterFeedback,
  createFutureScheduledBostonVisit: createFutureScheduledBostonVisit,
  createPastBostonVisitRequesterFeedbackVisitorFeedback: createPastBostonVisitRequesterFeedbackVisitorFeedback
};
export {TestVisits};

let tomorrow = new Date();
tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));
let yesterday = new Date();
yesterday.setTime(yesterday.getTime() - ( 24 * 60 * 60 * 1000));

function createFutureBostonNonScheduledVisit(requesterId, agencyId) {
  return {
    notes: 'future unscheduled visit for agency: '+agencyId,
    requestedDate: tomorrow,
    createdAt: new Date(),
    requesterId: requesterId,
    agencyId: agencyId,
    location: {
      address: "Boston",
      formattedAddress: "Boston",
      geo: {
        type: "Point",
        coordinates: [-71.0589, 42.3601]
      }
    }
  }
}
function createPastBostonNonScheduledVisit(requesterId, agencyId) {
  return {
    notes: 'past unscheduled visit for agency: '+agencyId,
    requestedDate: yesterday,
    createdAt: new Date(),
    requesterId: requesterId,
    agencyId: agencyId,
    location: {
      address: "Boston",
      formattedAddress: "Boston",
      geo: {
        type: "Point",
        coordinates: [-71.0589, 42.3601]
      }
    }
  }
}
function createPastBostonVisitRequesterFeedback(requesterId, agencyId, visitorId, requesterFeedbackId) {
  return {
    notes: 'past visit with requester feedback for agency: '+agencyId,
    requestedDate: yesterday,
    createdAt: new Date(),
    requesterId: requesterId,
    visitorId: visitorId,
    visitTime: yesterday,
    agencyId: agencyId,
    location: {
      address: "Boston",
      formattedAddress: "Boston",
      geo: {
        type: "Point",
        coordinates: [-71.0589, 42.3601]
      }
    },
    requesterFeedbackId: requesterFeedbackId || Random.id()
  }
}
function createFutureScheduledBostonVisit(requesterId, agencyId, visitorId) {
  return {
    notes: 'future scheduled visit for agency: '+agencyId,
    requestedDate: tomorrow,
    createdAt: new Date(),
    requesterId: requesterId,
    visitorId: visitorId,
    visitTime: tomorrow,
    agencyId: agencyId,
    location: {
      address: "Boston",
      formattedAddress: "Boston",
      geo: {
        type: "Point",
        coordinates: [-71.0589, 42.3601]
      }
    }
  }
}
function createPastBostonVisitRequesterFeedbackVisitorFeedback(requesterId, agencyId, visitorId, requesterFeedbackId, visitorFeedbackId) {
  return {
    notes: 'past scheduled visit with requester and visitor feedback for agency: '+agencyId,
    requestedDate: yesterday,
    createdAt: new Date(),
    requesterId: requesterId,
    visitorId: visitorId,
    visitTime: yesterday,
    agencyId: agencyId,
    location: {
      address: "Boston",
      formattedAddress: "Boston",
      geo: {
        type: "Point",
        coordinates: [-71.0589, 42.3601]
      }
    },
    requesterFeedbackId: requesterFeedbackId || Random.id(),
    visitorFeedbackId: visitorFeedbackId || Random.id()
  }
}

