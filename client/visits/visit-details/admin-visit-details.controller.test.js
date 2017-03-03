/**
 * Created by Daniel Biales on 2/28/17.
 */


import 'angular-mocks';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import {assert} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/visits/visit-details/admin-visit-details.controller.js';
import { Visit,Visits } from '/model/visits';
import { Feedbacks } from '/model/feedback';
import StubCollections from 'meteor/hwillson:stub-collections';

describe('AdminVisitDetails', function () {

  beforeEach(function () {
    angular.mock.module('visitry');
  });

  let controller;
  let scope;
  let today = new Date();
  let tomorrow = new Date();
  tomorrow = tomorrow.setDate(today.getDate() + 1);
  let yesterday = new Date();
  yesterday = yesterday.setDate(today.getDate() - 1);
  let visitId;

  beforeEach(()=> {
    visitId = Random.id();
    let defaultVisit = {
      _id: visitId
    };
    StubCollections.stub([Visits, Meteor.users, Feedbacks]);
    Visits.insert(defaultVisit);
  });

  beforeEach(inject(function (_$controller_, _$cookies_) {
    $cookies = _$cookies_;
    $controller = _$controller_;
  }));

  function initializeController() {
    controller = $controller('adminVisitDetailsCtrl', {$scope: scope}, {locals: {visitId: visitId}});
  }

  beforeEach(()=> {
    inject(function ($rootScope) {
      scope = $rootScope.$new(true);
      controller = $controller('adminVisitDetailsCtrl', {$scope: scope}, {locals: {visitId: visitId}});
    })
  });


  afterEach(function () {
    StubCollections.restore();
  });

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

  describe('visitStatus', ()=> {
    it('return complete', ()=> {
      Visits.update({_id: visitId}, {$set: {visitTime: yesterday}});
      initializeController();
      assert.equal(controller.visitStatus, 'complete');
    });
    it('return available', ()=> {
      Visits.update({_id: visitId}, {$set: {requestedDate: tomorrow}});
      initializeController();
      assert.equal(controller.visitStatus, 'available');
    });
    it('return scheduled', ()=> {
      Visits.update({_id: visitId}, {$set: {visitTime: tomorrow}});
      initializeController();
      assert.equal(controller.visitStatus, 'scheduled');
    });
    it('return unfilled', ()=> {
      Visits.update({_id: visitId}, {$set: {requestedDate: yesterday}});
      initializeController();
      assert.equal(controller.visitStatus, 'unfilled');
    });
    it('return cancelled', ()=> {
      Visits.update({_id: visitId}, {$set: {inactive: true}});
      initializeController();
      assert.equal(controller.visitStatus, "cancelled");
    });
  });

  describe('requester', ()=> {
    let requesterId;

    beforeEach(()=> {
      requesterId = Random.id();
      Visits.update({_id: visitId}, {$set: {requesterId: requesterId}});
      Meteor.users.insert({_id: requesterId});
    });

    it('returns requester details', ()=> {
      initializeController();
      assert.equal(controller.requester._id, requesterId);
    });
  });

  describe('visitor', ()=> {
    let visitorId;

    beforeEach(()=> {
      visitorId = Random.id();
      Meteor.users.insert({_id: visitorId});
    });

    it('returns visitor details', ()=> {
      Visits.update({_id: visitId}, {$set: {visitorId: visitorId}});
      initializeController();
      assert.equal(controller.visitor._id, visitorId);
    });
    it('returns null if visitorId is undefined', ()=> {
      assert.isUndefined(controller.visitor);
    });
  });

  describe('requesterFeedback', ()=> {
    let requesterId;
    let feedbackId;

    beforeEach(()=> {
      requesterId = Random.id();
      Visits.update({_id: visitId}, {$set: {requesterId: requesterId}});
      feedbackId = Random.id();
    });

    it('returns requesterFeedback', ()=> {
      Feedbacks.insert({_id: feedbackId, submitterId: requesterId, visitId: visitId});
      initializeController();
      assert.equal(controller.requesterFeedback._id, feedbackId);
    });
    it('returns null if no requesterFeedback', ()=> {
      initializeController();
      assert.isUndefined(controller.requesterFeedback);
    });
  });

  describe('visitorFeedback', ()=> {
    let visitorId;
    let feedbackId;

    beforeEach(()=> {
      visitorId = Random.id();
      Visits.update({_id: visitId}, {$set: {visitorId: visitorId}});
      feedbackId = Random.id();
    });

    it('returns visitorFeedback', ()=> {
      Feedbacks.insert({_id: feedbackId, submitterId: visitorId, visitId: visitId});
      initializeController();
      assert.equal(controller.visitorFeedback._id, feedbackId);
    });
    it('returns null if no visitorFeedback', ()=> {
      initializeController();
      assert.isUndefined(controller.visitorFeedback);
    });
  });

});

