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
    requesterId: {type: String, optional:true},  //TODO optional for now, can't get seed data to work when I use id
    requesterUsername: {type: String, optional:true},  //TODO not needed in the long run - here, to get seed data to work
    location: {type: LocationSchema },
    requestedDate: {type: Date},
    notes: {type: String, optional:true},
    visitorId: { type: String, optional:true},  //filled in when visit booked
    visitTime: {type: Date, optional:true },
    feedbackId: {type: String, optional: true}  //filled in after visit
});

//Visits.attachSchema(Visits.schema); //TODO we aren't quite ready to adhere to the schema

