import { Feedback } from '/model/feedback'
import { logger } from '/server/logging'
import { HTTP } from 'meteor/http'

//TODO - not used, if needed we would want to filter by agency
Meteor.publish("feedback", function (options) {
  return Feedback.find({}, options);
});

Meteor.methods({
  'feedback.createFeedback'(feedback) {
    var newFeedback = new Feedback(feedback);
    // save does a validate()
    newFeedback.save(function (err, id) {
      if (err) {
        throw err;
      }
    });
    Meteor.call('visits.attachFeedback', newFeedback.visitId, newFeedback._id);
    return newFeedback;
  },
  addNewQACard(title, desc, type){
    HTTP.post('https://api.trello.com/1/cards', {
      data: {
        idList: "5885424ab2b08d18d2363edf",
        pos: "top",
        name: title,
        desc: type + ': ' + desc
      }, params: {
        key: '22a7c1391a746ca09cc0b4e110cf968d',
        token: 'cb7d8bbd76c6448ee22561ed14ac93d9272c5129f13358871639b983af8d96fd'
      },
      headers: {"Content-Type": "application/json"}
    }, (err)=> {
      if (err) {
        logger.error('Failed to submit user app feedback ' + err);
        throw new Meteor.Error('apiError', err.reason);
      }
      logger.verbose('app feedback added');
    })
  }
});

