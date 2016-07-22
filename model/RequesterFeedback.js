import { Class } from 'meteor/jagi:astronomy';

const RequesterFeedbacks = new Mongo.Collection("requesterFeedback");

!//TODO check role
  RequesterFeedbacks.allow({
    insert: function (userId, visit) {
      return true;
    },
    update: function (userId, visit, fields, modifier) {
      return false;
    },
    remove: function (userId, visit) {
      return false;
    }
  });

var starValueValidator = [{
  type: 'gte',
  param: 1
},
  {
    type: 'lte',
    param: 5
  }];

const RequesterFeedback = Class.create({
  name: "RequesterFeedback",
  collection: RequesterFeedbacks,
  fields: {
    visitorId: {type: String, immutable: true},
    visitorRating: {type: Number, validators: starValueValidator},
    visitorComments: {type: String,optional:true},
    visitRating: {type: Number, validators: starValueValidator},
    visitComments: {type: String,optional:true},
    visitId: {type: String, immutable: true},
    createdAt: {type: Date, immutable: true}
  },
  behaviors: {
    timestamp: {
      hasCreatedField: true,
      createdFieldName: 'createdAt'
    }
  }
});

export {RequesterFeedbacks}
export {RequesterFeedback}