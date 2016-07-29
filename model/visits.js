/**
 * Created by sarahcoletti on 2/17/16.
 */
import { Class } from 'meteor/jagi:astronomy';
import { Address } from '/model/address';

const Visits = new Mongo.Collection("visits");

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

const Visit = Class.create({
  name: 'Visit',
  collection: Visits,
  fields: {
    requesterId: {type: String, immutable: true},
    agencyId: {type: String},
    location: {type: Address},
    requestedDate: {type: Date},
    notes: {type: String, optional: true},
    visitorId: {type: String, optional: true},
    visitTime: {type: Date, optional: true},
    scheduledAt: {type: Date, optional: true},
    visitorNotes: {type: String, optional: true},
    requesterFeedbackId: {type: String, optional: true},
    visitorFeedbackId: {type: String, optional: true},
    createdAt: {type: Date, immutable: true},
    updatedAt: {type: Date},
    inactive: {type: Boolean, optional: true},
    removedAt: {type: Date, optional: true},
    cancelledAt: {type: Date, optional: true}
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
      removedFieldName: 'inactive',
      hasRemovedAtField: true,
      removedAtFieldName: 'removedAt'
    }
  }
});

export { Visit };
export { Visits };
