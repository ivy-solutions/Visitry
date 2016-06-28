Meteor.publish("visits", function (options) {
  var today = new Date();
  today.setHours(0,0,0,0);
  // active future visit requests, or past requests for which feedback is needed
  return Visits.find({
    inactive: { $exists : false},
    $or: [ {feedbackId: null }, {requestedDate: {$gt: today }} ]
  },options);
});

Meteor.publish("availableVisits", function () {
  if (this.userId) {
    const defaultVicinity = 3000;
    const defaultLocation = { "type": "Point", "coordinates": [-71.0589, 42.3601] };  //default = Boston
    var user = Meteor.users.findOne({_id: this.userId}, {fields: {'userData.location': 1, 'userData.vicinity': 1}});
    var vicinity = user.userData.vicinity ? user.userData.vicinity : defaultVicinity;
    var fromLocation = user.userData.location ? user.userData.location.geo : defaultLocation;
    //active unfilled future visit requests
    return Visits.find({
      visitorId: {$exists: false},
      inactive: {$exists: false},
      requestedDate: {$gt: new Date()},
      'location.geo': {
        $near: {
          $geometry: fromLocation,
          $maxDistance: vicinity * 1609
        }
      }
    },{
      fields: {"requesterId": 1,"requestedDate": 1, "notes": 1, "location": 1}});
  } else  {
    this.ready();
  }
});

Meteor.methods({
  'visits.createVisit'(visit) {
    visit.requesterId = this.userId;
    visit.createdAt = new Date();

    check(visit,Visits.schema);
    //valid longitude and latitude
    var longitude = visit.location.geo.coordinates[0];
    var latitude = visit.location.geo.coordinates[1];
    if ( longitude < -180 || longitude > 180 || latitude < -90 | latitude > 90 ) {
      throw new Meteor.Error('invalid-location', "Location coordinates are invalid.")
    }

    Visits.insert(visit);
  },
  'visits.rescindRequest'(visitId) {
    check(visitId,String);
    const visit = Visits.findOne(visitId);
    if (!visit) {
      throw new Meteor.Error('not-found', 'Visit request not found.');
    }
    if (this.userId !== visit.requesterId) {
      throw new Meteor.Error('not-authorized', 'Only requester is allowed to cancel visit request.');
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
      throw new Meteor.Error('not-found');
    }
    if ( this.userId !== visit.visitorId) {
      throw new Meteor.Error('not-authorized', 'Only visitor is allowed to cancel scheduled visit.');
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
      throw new Meteor.Error('not-found');
    }
    //TODO communicate with requester
    Visits.update(visit._id, {$set: {visitorId: this.userId, visitTime: time, visitorNotes: notes, scheduledAt: new Date()}});
  },
  'visits.attachFeedback'(visitId, feedbackId) {
    check(visitId, String);
    check(feedbackId, String);

    const visit = Visits.findOne(visitId);
    if (!visit) {
      throw new Meteor.Error('not-found');
    }
    Visits.update(visit._id, {$set: {feedbackId: feedbackId}});
  }
});