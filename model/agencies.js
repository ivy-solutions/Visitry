/**
 * Created by sarahcoletti on 2/17/16.
 */
Agencies = new Mongo.Collection("agencies")

//TODO check role
Agencies.allow({
  insert: function (userId, agency) {
    return userId;
  },
  update: function (userId, agency, fields, modifier) {
    return userId;
  },
  remove: function (userId, agency) {
    return userId;
  }
});

// mongo 2dsphere
SphereSchema = new SimpleSchema({
  type: {type: String, allowedValues: ["Point"]},
  coordinates: {type: [Number], min: -180, max: 180, minCount:2, maxCount:2, decimal:true }
});

AddressSchema = new SimpleSchema({
  address: {type: String},
  geo: {
    type: SphereSchema,
    index: '2dsphere'
  }
});

Agencies.schema = new SimpleSchema({
  name: {type:String },
  description: {type: String, optional:true},
  website: {type: SimpleSchema.RegEx.Url, optional:true},
  location: {type: AddressSchema },
  activeUntil: {type: Date, optional:true},
  administratorId: {type: String, regEx: SimpleSchema.RegEx.Id},
  contactEmail: {type: SimpleSchema.RegEx.Email},
  contactPhone: {type: String },
  logos: {type: [String], optional:true},
  createdAt: {type:Date}
});

Agencies.attachSchema(Agencies.schema);



