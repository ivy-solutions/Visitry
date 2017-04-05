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
import { Roles } from 'meteor/alanning:roles'
import { Visit,Visits } from '/model/visits'
import { Feedback,Feedbacks } from '/model/feedback'
import StubCollections from 'meteor/hwillson:stub-collections';

describe('UserDetails', function () {

  beforeEach(function () {
    angular.mock.module('visitry');
    angular.mock.module('ngCookies', 'visitry');
  });

  let testUserId = Random.id();
  let completedVisitId = Random.id();
  let today = new Date();
  let yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  let tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  let oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

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
    createdAt: oneMonthAgo,
    submitterId: testUserId,
    timeSpent: 5 * 60
  };

  let visitIds = [];
  let feedbackIds = [];

  let AdminVisitDetailsDialogMock = {
    open: (visitId)=> {
      return visitId;
    }
  };

  beforeEach(function () {
    StubCollections.stub([Visits,Feedbacks]);
    Visits.insert(completedVisit);
    Visits.insert(scheduledVisit);
    Visits.insert(availableVisit);
    Visits.insert(incompleteVisit);
     Feedbacks.insert(feedbackTwoHours);
    Feedbacks.insert(feedbackThreeHours);
    Feedbacks.insert(feedbackLongAgo);
  });

  let controller;
  beforeEach(inject(function (_$controller_, _$cookies_, $rootScope) {
    controller = _$controller_('userDetailsCtrl', {
      $scope: $rootScope.$new(true),
      AdminVisitDetailsDialog: AdminVisitDetailsDialogMock
    }, {locals: {userId: testUserId}});
    $cookies = _$cookies_;
  }));

  afterEach(function () {
    StubCollections.restore();
  });

  //skip - it does not truly test the cookie is set since controller.agencyId is always 'undefined'
  describe('AgencyId Cookie', () => {
    beforeEach(()=> {
      $cookies.put('agencyId', Random.id());
    });
    afterEach(()=> {
      $cookies.remove('agencyId');
    });
    it('agencyId cookie is not null', ()=> {
      assert.isNotNull(controller.agencyId);
    });
  });

  describe('pageChanged', function () {
    it('changing the page changes the page variable', ()=> {
      controller.pageChanged(1);
      assert.equal(controller.page, 1);
    });
  });

  describe('Visit counts and feedback sums', ()=> {

    it('completedVisitsCount should be 1', ()=> {
      assert.equal(controller.completedVisitsCount, 1);
    });

    it('pendingVisitsCount should include available and scheduled', ()=> {
      assert.equal(controller.pendingVisitsCount, 2);
    });

    it('unfilledVisitsCount should be 1', ()=> {
      assert.equal(controller.unfilledVisitsCount, 1);
    });

    it('counts hours in the last month', ()=> {
      assert.equal(controller.hoursCount, 5);
    });

    it('getUserVisitFeedback returns feedback of id that was passed', ()=> {
      let result = controller.getUserVisitFeedback(completedVisitId);
      assert.equal(result.visitId, completedVisitId);
      assert.equal(result.timeSpent / 60, 2);
    });
  });

  describe('getVisitDetails', ()=> {
    let AdminVisitDetailsDialogSpy;
    beforeEach(()=> {
      AdminVisitDetailsDialogSpy = sinon.spy(AdminVisitDetailsDialogMock, 'open');
    });
    afterEach(()=> {
      AdminVisitDetailsDialogMock.open.restore();
    });
    it('getVisitDetails opens AdminVisitDetailsDialog', ()=> {
      let visitId = Random.id();
      controller.getVisitDetails(visitId);
      assert(AdminVisitDetailsDialogSpy.calledWith(visitId));
    });
  });

});