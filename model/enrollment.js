/**
 * Created by sarahcoletti on 4/3/17.
 */
import { Class } from 'meteor/jagi:astronomy';

const Enrollments = new Mongo.Collection("enrollments");

Enrollments.allow({
  insert: function (userId, enrollment) {
    return userId;
  },
  update: function (userId, enrollment, fields, modifier) {
    return userId;
  },
  remove: function (userId, enrollment) {
    return userId;
  }
});

const Enrollment = Class.create({
  name: 'Enrollment',
  collection: Enrollments,
  fields: {
    agencyId: {type: String, immutable: true, index:1 },
    userId: {type: String, immutable: true, index:1 },
    applicationDate: {type: Date},
    approvalDate: {type: Date, optional: true},
    removed: {type:Boolean, optional: true },
    removedAt: {type: Date, optional: true}
  },
  indexes:{
    user: {
      fields: {
        userId: 1,
        agencyId: 1
      },
      options: {
        unique: true
      }
    }
  },
  behaviors: {
    timestamp: {
      hasCreatedField: true,
      createdFieldName: 'applicationDate',
      hasUpdatedField: false
    },
    softremove: {
      removedFieldName: 'removed',
      hasRemovedAtField: true,
      removedAtFieldName: 'removedAt'
    }
  }
});

export {Enrollment};
export {Enrollments};
