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
  name: { type: String },
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
    requesterId: {type: String, regEx: SimpleSchema.RegEx.Id},
    location: {type: LocationSchema },
    requestedDate: {type: Date},
    //TODO requiring a future requestedDate interferes with our demo seed data, eventually we can do this check
    //requestedDate: {type: Date,
    //  custom: function() {
    //    var today = new Date(); //must be after today
    //    if(today > this.value) {
    //      return 'minDate';  //Error string
    //    } else {
    //      return true;
    //    }
    //  }
    //},
    notes: {type: String, optional:true},
    createdAt: {type:Date},
    visitorId: { type: String, regEx: SimpleSchema.RegEx.Id, optional:true},  //filled in when visit booked
    visitTime: {type: Date, optional:true },
    scheduledAt: { type: Date, optional: true},
    visitorNotes: {type:String, optional:true},
    feedbackId: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true}  //filled in after visit
});

Visits.attachSchema(Visits.schema);

