/**
 * Created by sarahcoletti on 2/17/16.
 */
import { Class } from 'meteor/jagi:astronomy';
import { Address } from '/model/address';

const Agencies = new Mongo.Collection("agencies");

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

const Agency = Class.create({
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
    timezone: { type: String, default: 'America/New_York'},
    activeUntil: {type: Date, optional: true },
    administratorId: { type: String },  //default mongo id generation is a string (if we want ObjectId, we would have to say so when teh collection is created)
    contactEmail: { type: String,
      validators: [{type: 'email'}]},
    contactPhone: { type: String },
    logos: {type: [String], optional: true },
    welcomeMessage: {type: String, optional:true},
    createdAt: {type:Date, immutable: true},
    updatedAt: {type:Date},
    removed: {type:Boolean, optional: true },
    removedAt: {type: Date, optional: true}
  },
  indexes: {
    geolocation: {
      fields: {
        'location.geo': '2dsphere'
      }
    }
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

export {Agency};
export {Agencies};




