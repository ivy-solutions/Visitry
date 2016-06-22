/**
 * Created by sarahcoletti on 6/22/16.
 */
Meteor.startup(function () {
  Visits._ensureIndex({ "location.geo.coordinates": '2dsphere'});
});