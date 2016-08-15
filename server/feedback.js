import { Feedback } from '/model/feedback'
import { logger } from '/server/logging'

//TODO - not used, if needed we would want to filter by agency
Meteor.publish("feedback", function (options) {
  return Feedback.find({},options);
});

Meteor.methods({
  'feedback.createFeedback'(feedback) {
    var newFeedback = new Feedback(feedback);
    newFeedback.save()
    return newFeedback._id;
  }
});

