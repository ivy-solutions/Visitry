/**
 * Created by sarahcoletti on 8/12/16.
 */
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert,expect,fail,to } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { HTTP } from 'meteor/http'
import { Feedback, Feedbacks } from '/model/feedback'
import '/server/feedback.js';
import StubCollections from 'meteor/hwillson:stub-collections';

if (Meteor.isServer) {

  var testFeedback;

  describe('Feedback', () => {

    var meteorStub;

    beforeEach(() => {
      StubCollections.stub(Meteor.users);

      meteorStub = sinon.stub(Meteor, 'call');
      testFeedback = {
        visitorId: Random.id(),
        requesterId: Random.id(),
        submitterId: Random.id(),
        companionRating: 2,
        companionComments: "Two star comments",
        visitRating: 4,
        visitComments: "4 star comments",
        visitId: Random.id(),
        timeSpent: 60
      };
    });
    afterEach(function () {
      meteorStub.restore();
      StubCollections.restore();
    });

    describe('feedback.createFeedback method', () => {
      const createHandler = Meteor.server.method_handlers['feedback.createFeedback'];

      it('creates feedback', () => {
        const invocation = {userId: Random.id()};
        createHandler.apply(invocation, [testFeedback])
        assert.equal(Feedbacks.find().count(), 1);
      });
      it('fails if no user rating', () => {
        const invocation = {userId: Random.id()};
        testFeedback.companionRating = null;
        assert.throws(function () {
          createHandler.apply(invocation, [testFeedback]);
        }, '"companionRating" is required');
      });
      it('fails if user rating too low', () => {
        const invocation = {userId: Random.id()};
        testFeedback.companionRating = 0;
        assert.throws(function () {
          createHandler.apply(invocation, [testFeedback]);
        }, '"companionRating" has to be greater than or equal 1');
      });
      it('fails if user rating too high', () => {
        const invocation = {userId: Random.id()};
        testFeedback.companionRating = 6;
        assert.throws(function () {
          createHandler.apply(invocation, [testFeedback]);
        }, '"companionRating" has to be less than or equal 5');
      });
      it('fails if no visit rating', () => {
        const invocation = {userId: Random.id()};
        testFeedback.visitRating = null;
        assert.throws(function () {
          createHandler.apply(invocation, [testFeedback]);
        }, '"visitRating" is required');
      });
      it('fails if user rating too low', () => {
        const invocation = {userId: Random.id()};
        testFeedback.visitRating = 0;
        assert.throws(function () {
          createHandler.apply(invocation, [testFeedback]);
        }, '"visitRating" has to be greater than or equal 1');
      });
      it('fails if user rating too high', () => {
        const invocation = {userId: Random.id()};
        testFeedback.visitRating = 6;
        assert.throws(function () {
          createHandler.apply(invocation, [testFeedback]);
        }, '"visitRating" has to be less than or equal 5');
      });
    });

    describe('feedback.addNewQACard', ()=> {
      const addNewQACardHandler = Meteor.server.method_handlers['addNewQACard'];
      let meteorHTTPPostStub;
      beforeEach(()=> {
        meteorHTTPPostStub = sinon.stub(HTTP, 'post', (...args)=>args);
      });
      afterEach(()=> {
        HTTP.post.restore();
      });
      it('add new QA card has correct body', ()=> {
        const invocation = {userId: Random.id()};
        addNewQACardHandler.apply(invocation, ['title', 'description', 'type']);
        let result = meteorHTTPPostStub.returnValues[0];
        assert.equal(result[0], 'https://api.trello.com/1/cards');
        assert.deepPropertyVal(result[1], 'data.name', 'title', 'Error: name value incorrect');
        assert.deepPropertyVal(result[1], 'data.desc', 'type: description', 'Error: description incorrect');
      });
    });

    // Currently the aggregate package is untestable
    /*    describe('feedback.feedbackTotalHours', ()=> {
     let visitorId;
     let yesterDayDate;
     let weekAgoDate;
     beforeEach(()=> {
     Meteor.call.restore();
     yesterDayDate = new Date();
     yesterDayDate.setDate(yesterDayDate.getDate() - 1);
     weekAgoDate = new Date();
     weekAgoDate.setDate(weekAgoDate.getDate() - 7);
     visitorId = Random.id();
     StubCollections.stub([Feedbacks]);
     Feedbacks.insert({visitorId: visitorId, submitterId: visitorId, createdAt: yesterDayDate.getTime(), timeSpent: 3});
     Feedbacks.insert({visitorId: visitorId, submitterId: visitorId, createdAt: weekAgoDate.getTime(), timeSpent: 2});
     Feedbacks.insert({visitorId: Random.id(), submitterId: Random.id(), createdAt: yesterDayDate.getTime(), timeSpent: 1})
     });
     afterEach(()=> {
     StubCollections.restore();
     });
     it('feedback total hours should be 5 if from date is 0', ()=> {
     let totalHours = Meteor.call('feedbackTotalHours', visitorId, 0);
     assert.equal(totalHours, 5);
     });
     it('feedback total hours should be 3 if from date is 3 days ago', ()=> {
     let threeDaysAgoDate = new Date();
     threeDaysAgoDate.setDate(threeDaysAgoDate.getDate() - 3);
     let totalHours = Meteor.call('feedbackTotalHours', visitorId, threeDaysAgoDate.getTime());
     assert.equal(totalHours, 3);
     });
     });*/
  });
}