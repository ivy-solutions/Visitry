/**
 * Created by sarahcoletti on 2/17/16.
 */
Visits = new Mongo.Collection("visits");


Visits.allow({
  insert: function (userId, visit) {
    return true;
  },
  update: function (userId, visit, fields, modifier) {
    return true;
  },
  remove: function (userId, visit) {
    return true;
  }
});


    // mongo 2dsphere
SphereSchema = new SimpleSchema({
  type: {type: String, allowedValues: ["Point"]},
  coordinates: {type: [Number], min: -180, max: 180, minCount:2, maxCount:2, decimal:true }
});

LocationSchema = new SimpleSchema({
  name: {type: String},
  geo: {
    type: SphereSchema,
    index: '2dsphere'
  }
});

Visits.schema = new SimpleSchema({
    requesterId: {type: String, regEx: SimpleSchema.RegEx.Id},
    location: {type: LocationSchema },
    requestedDate: {type: Date},
    notes: {type: String, optional:true},
    createdAt: {type:Date},
    visitorId: { type: String, regEx: SimpleSchema.RegEx.Id, optional:true},  //filled in when visit booked
    visitTime: {type: Date, optional:true },
    scheduledAt: { type: Date, optional: true},
    visitorNotes: {type:String, optional:true},
    feedbackId: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},  //filled in after visit
    inactive: {type: Boolean, optional:true}  //set if requester rescinds the request
});

Visits.attachSchema(Visits.schema);

