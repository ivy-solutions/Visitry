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

LocationSchema = new SimpleSchema({
  longitude: {
    type: Number,
    decimal : true,
    min: -180,
    max: 180
  },
  latitude: {
    type: Number,
    decimal: true,
    min: -90,
    max: 90
  }
});

Visits.schema = new SimpleSchema({
    requestorId: {type: String},
    visitorId: { type: String, optional:true},  //filled in when visit booked
    location: {type: LocationSchema },
    requestedDate: {type: Date},
    notes: {type: String, optional:true},
    feedbackId: {type: String, optional: true},
    visitTime: {type: Date }
});

