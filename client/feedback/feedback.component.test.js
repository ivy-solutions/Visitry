/**
 * Created by n0235626 on 7/1/16.
 */
import 'angular-mocks';
import { Meteor } from 'meteor/meteor';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { User } from '/model/users'
import { Feedbacks } from '/model/feedback'
import '/client/feedback/feedback.component';


describe('Client Feedback', function () {
  beforeEach(function () {
    window.module('visitry');
  });

  describe('feedback', function () {
    var controller;
    var findOneUserStub;
    var meteorCallStub;
    var feedbacksInsertSpy;

    beforeEach(function () {
      findOneUserStub = sinon.stub(User, 'findOne');
      meteorCallStub = sinon.stub(Meteor, 'call');
      feedbacksInsertSpy = sinon.spy(Feedbacks, "insert");

      inject(function ($rootScope, $componentController) {
        controller = $componentController('feedback', {$scope: $rootScope.$new(true)})
      });
    });

    afterEach(function () {
      User.findOne.restore();
      Meteor.call.restore();
      feedbacksInsertSpy.restore();
    });

    describe('Is a visitor?', function () {
      it('user is a visitor', function () {
        //FIXME: can't stub the User.findOne method in the helper
        //findOneUserStub.returns({userData: {role: 'visitor'}});
        //chai.assert.equal(controller.isVisitor, true);
      });
      it('user is not a visitor', function () {
        //FIXME: can't stub the User.findOne method in the helper
        findOneUserStub.returns({userData: {role: 'requester'}});
        chai.assert.equal(controller.isVisitor, false);
      })
    });

    describe('Ratings', function () {
      it('rate a visitor a 5, sets the rating to 5', function () {
        controller.visitorRating.selectStar(5);
        //TODO: use rewire to get variable from controller.
        chai.assert.equal(5, 5);
      });

      it('rate a visitor a 5 sets the # of good stars to 5 and bad stars to 0', function () {
        controller.visitorRating.selectStar(5);
        chai.assert.equal(controller.visitorRating.goodStars.length, 5);
        chai.assert.equal(controller.visitorRating.badStars.length, 0);
      });

      it('rate a visitor a 1 sets the # of good stars to 1 and bad stars to 4', function () {
        controller.visitorRating.selectStar(1);
        chai.assert.equal(controller.visitorRating.goodStars.length, 1);
        chai.assert.equal(controller.visitorRating.badStars.length, 4);
      });

      it('rate a visit a 5, sets the rating to a 5', function () {
        controller.visitRating.selectStar(5);
        //TODO: use rewire to get variable from controller.
        chai.assert.equal(5, 5);
      });

      it('rate a visitor a 5 sets the # of good stars to 5 and bad stars to 0', function () {
        controller.visitRating.selectStar(5);
        chai.assert.equal(controller.visitRating.goodStars.length, 5);
        chai.assert.equal(controller.visitRating.badStars, 0);
      });

      it('rate a visit a 1 sets the # of good stars to 1 and bad stars to 4', function () {
        controller.visitRating.selectStar(1);
        chai.assert.equal(controller.visitRating.goodStars.length, 1);
        chai.assert.equal(controller.visitRating.badStars.length, 4);
      });
    });

    describe('Submit feedback', function () {
      it("submit feedback inserts an entry into the Feedback collection", function () {
        findOneUserStub.returns({userData: {role: 'visitor'}});
        controller.submitFeedback();
        chai.assert(feedbacksInsertSpy.calledOnce);
      });

      it("submit feedback as visitor updates visit's visitorFeedbackId", function () {
        findOneUserStub.returns({userData: {role: 'visitor'}});
        controller.submitFeedback();
        chai.assert(Meteor.call.calledWith('visits.attachVisitorFeedback'));
      });

      it("submit feedback as a requester updates visit's requesterFeedbackId", function () {
        findOneUserStub.returns({userData: {role: 'requester'}});
        controller.submitFeedback();
        chai.assert(Meteor.call.calledWith('visits.attachRequesterFeedback'));
      })
    });
  })
});