import { Class } from 'meteor/jagi:astronomy';

const Feedbacks = new Mongo.Collection("feedback");

  Feedbacks.allow({
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

const Feedback = Class.create({
  name: "Feedback",
  collection: Feedbacks,
  fields: {
    visitorId: {type: String, immutable: true},
    requesterId: {type:String,immutable:true},
    submitterId:{type:String,immutable:true},
    userRating: {type: Number, validators: starValueValidator},
    userComments: {type: String,optional:true},
    visitRating: {type: Number, validators: starValueValidator},
    visitComments: {type: String,optional:true},
    visitId: {type: String, immutable: true},
    createdAt: {type: Date, immutable: true},
    timeSpent: {type: Number, optional: true }
  },
  behaviors: {
    timestamp: {
      hasCreatedField: true,
      createdFieldName: 'createdAt'
    }
  }
});

export {Feedbacks}
export {Feedback}