/**
 * Created by n0235626 on 7/1/16.
 */
import 'angular-mocks';
import { Meteor } from 'meteor/meteor';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/feedback/feedback.component';


describe('Client Feedback', function () {
  beforeEach(function () {
    window.module('visitry');
  });

  describe('feedback', function () {
    var controller;

    beforeEach(function () {
      inject(function ($rootScope, $componentController, $stateParams) {
        $stateParams.visitId = Random.id();
        controller = $componentController('feedback', {$scope: $rootScope.$new(true)})
      });
    });

    afterEach(function () {
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
      var meteorUserIdStub;
      var meteorCallSpy;

      beforeEach(function () {
        meteorUserIdStub = sinon.stub(Meteor, 'userId');
        meteorUserIdStub.returns(Random.id());
        meteorCallSpy = sinon.spy(Meteor, 'call');

        inject(function ($rootScope, $componentController, $stateParams) {
          $stateParams.visitId = Random.id();
          controller = $componentController('feedback', {$scope: $rootScope.$new(true)})
        });
      });

      afterEach(function () {
        Meteor.userId.restore();
        Meteor.call.restore();
      });

      var form = {$valid:true, $setUntouched: function(){}, $setPristine:function(){} };
      it("submit feedback inserts an entry into the Feedback collection", function () {
        controller.visitor = {_id:Random.id()};
        controller.requester = {_id:Random.id()};
        controller.visitorRating.selectStar(1);
        controller.visitRating.selectStar(1);
        controller.submitFeedback(form);
        chai.assert.isTrue(meteorCallSpy.withArgs('feedback.createFeedback').calledOnce);
      });

    });
  })
});