Meteor.publish("visits", function (options) {
  var today = new Date();
  today.setHours(0,0,0,0);
  // active future visit requests, or past requests for which feedback is needed
  return Visits.find({
    inactive: { $exists : false},
    $or: [ {feedbackId: null }, {requestedDate: {$gt: today }} ]
  },options);
});

Meteor.methods({
  'visits.rescindRequest'(visitId) {
    check(visitId,String);

    const visit = Visits.findOne(visitId);

    if (!visit) {
      throw new Meteor.Error('request not found');
    }

    if (this.userId !== visit.requesterId) {
      throw new Meteor.Error('not authorized');
    }

    //TODO - we want to communicate and deactivate visit requests that have already been booked.
    if (visit.visitorId) {
      //communicate with visitor
    }

    Visits.update(visitId, {$set: {inactive: true }});
  },
  'visits.cancelScheduled'(visitId) {
    check(visitId, String);

    const visit = Visits.findOne(visitId);

    if (!visit) {
      throw new Meteor.Error('visit not found');
    }

    if ( this.userId !== visit.visitorId) {
      throw new Meteor.Error('not authorized');
    }

    //TODO communicate with requester
    Visits.update(visit._id, {$set: { cancelledAt: new Date()},
        $unset: {visitorId: "", visitTime:""}
    });
  },
  'visits.scheduleVisit'(visitId, time, notes) {
    check(visitId, String);
    check(time, Date);
    check(notes, String);

    const visit = Visits.findOne(visitId);

    if (!visit) {
      throw new Meteor.Error('visit not found');
    }
    //TODO communicate with requester

    Visits.update(visit._id, {$set: {visitorId: this.userId, visitTime: time, visitorNotes: notes, scheduledAt: new Date()}});
  },
  'visits.attachFeedback'(visitId, feedbackId) {
    check(visitId, String);
    check(feedbackId, String);

    const visit = Visits.findOne(visitId);
    if (!visit) {
      throw new Meteor.Error('visit not found');
    }

    Visits.update(visit._id, {$set: {feedbackId: feedbackId}});
  }
});