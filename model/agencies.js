/**
 * Created by sarahcoletti on 2/17/16.
 */
import { Class } from 'meteor/jagi:astronomy';

Agencies = new Mongo.Collection("agencies");

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

const GeoLocation = Class.create({
  name: 'GeoLocation',
  fields: {
    type: {
      type: String, default: "Point",
      validator: [{
        type: 'equal', resolveParam() {
          return 'Point'
        }
      }]
    },
    coordinates: {
      type: [Number],
      validator: [
        {type: 'length', param: 2},
        {
          type: 'every', param: [
          {type: 'gt', param: -180},
          {type: 'lt', param: 180}
        ]
        }
      ]
    }
  }
});

const Address = Class.create({
  name: 'Address',
  fields: {
    address: {type: String},
    geo: {type: GeoLocation}
  }
});

Agency = Class.create({
  name: 'Agency',
  collection: Agencies,
  fields: {
    name: { type: String,
      validators: [{ type: 'minLength', param: 3}]},
    description: { type: String, optional: true},
    website: { type: String, optional: true,
      validators: [{
        type: 'regexp',
        param: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/ ,
        message: '"website" should be a valid URL'}] },  //URL validator
    location: { type: Address },  // Note: 2dsphere index is added in startup
    activeUntil: {type: Date, optional: true },
    administratorId: { type: Mongo.ObjectID },
    contactEmail: { type: String,
      validators: [{type: 'email'}]},
    contactPhone: { type: String },
    logos: {type: [String], optional: true },
    createdAt: {type:Date, immutable: true},
    updatedAt: {type:Date},
    removedAt: {type: Date, optional: true}
  },
  behaviors: {
    timestamp: {
      hasCreatedField: true,
      createdFieldName: 'createdAt',
      hasUpdatedField: true,
      updatedFieldName: 'updatedAt'
    },
    softremove: {
      removedFieldName: 'removed',
      hasRemovedAtField: true,
      removedAtFieldName: 'removedAt'
    }
  }
});




