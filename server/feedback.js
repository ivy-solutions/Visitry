Meteor.publish("feedback", function (options) {
  return Feedback.find({},options);
});
