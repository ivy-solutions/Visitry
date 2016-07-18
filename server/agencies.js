/**
 * Created by sarahcoletti on 6/30/16.
 */
import Agencies from '/model/agencies'

Meteor.publish("allAgencies", function (options) {
  var today = new Date();
  today.setHours(0,0,0,0);
  // active agencies
  return Agencies.find({
    activeUntil: { $gt : today}
  },options);
});
