/**
 * Created by sarahcoletti on 8/12/16.
 */
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert,expect,fail,to } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';

import { Feedback, Feedbacks } from '/model/feedback'
import '/server/feedback.js';

if (Meteor.isServer) {

  var testFeedback;

  describe('Feedback', () => {

    var meteorStub;

    beforeEach(() => {
      meteorStub = sinon.stub(Meteor, 'call');
      testFeedback = {
        visitorId: Random.id(),
        requesterId: Random.id(),
        submitterId: Random.id(),
        userRating: 2,
        userComments: "Two star comments",
        visitRating: 4,
        visitComments: "4 star comments",
        visitId: Random.id(),
        timeSpent: 60
      };
    });
    afterEach(function () {
      meteorStub.restore();
    });

    describe('feedback.createFeedback method', () => {
      const createHandler = Meteor.server.method_handlers['feedback.createFeedback'];
      beforeEach(() => {
        Feedbacks.remove({});
      });

      it('creates feedback', () => {
        const invocation = {userId: Random.id()};
        createHandler.apply(invocation, [testFeedback]);
        assert.equal(Feedbacks.find().count(), 1);
      });
      it('fails if no user rating', () => {
        const invocation = {userId: Random.id()};
        testFeedback.userRating = null;
        assert.throws( function() { createHandler.apply(invocation,[testFeedback]); }, '"userRating" is required');
      });
      it('fails if user rating too low', () => {
        const invocation = {userId: Random.id()};
        testFeedback.userRating = 0;
        assert.throws( function() { createHandler.apply(invocation,[testFeedback]); }, '"userRating" has to be greater than or equal 1');
      });
      it('fails if user rating too high', () => {
        const invocation = {userId: Random.id()};
        testFeedback.userRating = 6;
        assert.throws( function() { createHandler.apply(invocation,[testFeedback]); }, '"userRating" has to be less than or equal 5');
      });
      it('fails if no visit rating', () => {
        const invocation = {userId: Random.id()};
        testFeedback.visitRating = null;
        assert.throws( function() { createHandler.apply(invocation,[testFeedback]); }, '"visitRating" is required');
      });
      it('fails if user rating too low', () => {
        const invocation = {userId: Random.id()};
        testFeedback.visitRating = 0;
        assert.throws( function() { createHandler.apply(invocation,[testFeedback]); }, '"visitRating" has to be greater than or equal 1');
      });
      it('fails if user rating too high', () => {
        const invocation = {userId: Random.id()};
        testFeedback.visitRating = 6;
        assert.throws( function() { createHandler.apply(invocation,[testFeedback]); }, '"visitRating" has to be less than or equal 5');
      });
    });
  });
}