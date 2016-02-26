/**
 * Created by sarahcoletti on 2/25/16.
 */
Meteor.publish("availableVisits", function () {
  let selector = {
      'visitorId': {$exists: false}
  };
  return Visits.find(selector);
});