Meteor.publish("visits", function (options) {
  return Visits.find({},options);
});