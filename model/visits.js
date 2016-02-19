/**
 * Created by sarahcoletti on 2/17/16.
 */
Visits = new Mongo.Collection("visits")

//TODO check role
Visits.allow({
  insert: function (userId, visit) {
    return userId;
  },
  update: function (userId, visit, fields, modifier) {
    return userId;
  },
  remove: function (userId, visit) {
    return userId;
  }
});

