/**
 * Created by Daniel Biales on 2/1/17.
 */

import 'angular-mocks';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { visitry } from '/client/lib/app.js';
import {assert} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/users/user-details.controller.js';
import StubCollections from 'meteor/hwillson:stub-collections';
import { Roles } from 'meteor/alanning:roles'
import { Visit,Visits } from '/model/visits'
import { Feedback,Feedbacks } from '/model/feedback'
import {VisitorUsers} from '/model/users'

describe('UserDetails', function () {

  beforeEach(function () {
    angular.mock.module('visitry');
  });

  beforeEach(inject(function (_$controller_, _$cookies_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
    $cookies = _$cookies_;
  }));

  var controller;
  var scope;
  let testUserId = Random.id();
  let completedVisitId = Random.id();
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  let twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  let completedVisit = {
    _id: completedVisitId,
    requesterId: 'something',
    requestedDate: yesterday,
    visitorId: testUserId,
    visitTime: yesterday,
    createdAt: yesterday,
    updatedAt: yesterday
  };
  let availableVisit = {
    requesterId: testUserId,
    requestedDate: tomorrow,
    createdAt: yesterday,
    updatedAt: yesterday
  };
  let scheduledVisit = {
    requesterId: testUserId,
    requestedDate: tomorrow,
    visitorId: 'something',
    visitTime: tomorrow,
    createdAt: yesterday,
    updatedAt: yesterday
  };
  let incompleteVisit = {
    requesterId: testUserId,
    requestedDate: yesterday,
    createdAt: yesterday,
    updatedAt: yesterday
  };
  let feedbackTwoHours = {
    visitId: completedVisitId,
    createdAt: yesterday,
    submitterId: testUserId,
    timeSpent: 2 * 60
  };
  let feedbackThreeHours = {
    createdAt: yesterday,
    submitterId: testUserId,
    timeSpent: 3 * 60
  };
  let feedbackLongAgo = {
    createdAt: twoMonthsAgo,
    submitterId: testUserId,
    timeSpent: 5 * 60
  };


  beforeEach(function () {
    StubCollections.stub([Meteor.users, Visits, Feedbacks, VisitorUsers]);
    Visits.insert(completedVisit);
    Visits.insert(scheduledVisit);
    Visits.insert(availableVisit);
    Visits.insert(incompleteVisit);
    Feedbacks.insert(feedbackTwoHours);
    Feedbacks.insert(feedbackThreeHours);
    Feedbacks.insert(feedbackLongAgo);

    inject(function ($rootScope) {
      scope = $rootScope.$new(true);
      controller = $controller('userDetailsCtrl', {$scope: scope}, {locals: {userId: testUserId}});
    });
  });

  afterEach(function () {
    StubCollections.restore();
  });

  describe('AgencyId Cookie', () => {
    beforeEach(function () {
      $cookies.put('agencyId', Random.id);
    });
    afterEach(function () {
      $cookies.remove('agencyId');
    });
    it('agencyId cookie is not null', function () {
      assert.isNotNull(controller.agencyId);
    });
  });

  describe('pageChanged', function () {
    it('changing the page changes the page variable', ()=> {
      controller.pageChanged(1);
      assert.equal(controller.page, 1);
    });
  });

  describe('completedVisitsCount', ()=> {
    it('comletedVisitsCount should be 1', ()=> {
      assert.equal(controller.completedVisitsCount, 1);
    });
  });

  describe('pendingVisitsCount', ()=> {
    it('pendingVisitsCount should include available and scheduled', ()=> {
      assert.equal(controller.pendingVisitsCount, 2);
    });
  });

  describe('unfilledVisitsCount', ()=> {
    it('unfilledVisitsCount should be 1', ()=> {
      assert.equal(controller.unfilledVisitsCount, 1);
    });
  });

  describe('hoursCount', ()=> {
    it('counts hours in the last month', ()=> {
      assert.equal(controller.hoursCount, 5);
    });
  });

  describe('getUserVisitFeedback', ()=> {
    it('getUserVisitFeedback returns feedback of id that was passed', ()=> {
      let result = controller.getUserVisitFeedback(completedVisitId);
      assert.equal(result.visitId, completedVisitId);
      assert.equal(result.timeSpent / 60, 2);
    });
  });

});