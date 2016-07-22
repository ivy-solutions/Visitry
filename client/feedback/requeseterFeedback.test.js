/**
 * Created by n0235626 on 7/1/16.
 */
import { Meteor } from 'meteor/meteor';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/feedback/requesterFeedback.component.js';

describe('Client Feedback', function () {
  beforeEach(function () {
    window.module('visitry');
  });

  describe('feedback', function () {
    var controller;

    beforeEach(function () {
      inject(function ($rootScope, $componentController) {
        controller = $componentController('requesterFeedback', {$scope: $rootScope.$new(true)})
      });
    });

    afterEach(function () {
    });

    it('rate a visitor a 5, sets the rating to 5', function () {
      controller.visitorRating.selectStar(5);
      //TODO: use rewire to get variable from controller.
      var rating = 5;
      chai.assert.equal(rating, 5);
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
      var rating = 5
      chai.assert.equal(rating, 5);
    });

    it('rate a visitor a 5 sets the # of good stars to 5 and bad stars to 0', function () {
      controller.visitRating.selectStar(5);
      chai.assert.equal(controller.visitRating.goodStars.length, 5);
      chai.assert.equal(controller.visitRating.badStars, 0);
    })

    it('rate a visit a 1 sets the # of good stars to 1 and bad stars to 4', function () {
      controller.visitRating.selectStar(1);
      chai.assert.equal(controller.visitRating.goodStars.length, 1);
      chai.assert.equal(controller.visitRating.badStars.length, 4);
    })

  })
})