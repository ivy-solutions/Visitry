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

