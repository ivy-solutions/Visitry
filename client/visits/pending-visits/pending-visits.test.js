/**
 * Created by n0235626 on 6/6/16.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/visits/pending-visits/pending-visits.controller';
import '/client/visits/request-visit/request-visit-modal.service'
import Visits from '/model/visits.js'

describe('Pending Visit Requests', function () {
  beforeEach(function () {
    angular.mock.module('visitry');
  });

  beforeEach(inject(function (_$controller_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  var controller;
  var spyOnConfirm;
  beforeEach(function () {
    sinon.stub(Meteor.myFunctions, 'groupVisitsByRequestedDate');

    var promise = {then: function(){}, error: function(){} };
    var mockIonicPopup = {
      confirm: function(){
        return promise;
      }
     };
     var feedback = {stop: function(){}};
    spyOnConfirm = sinon.spy(mockIonicPopup, 'confirm');
    inject(function ($rootScope,$ionicPopup) {
       controller = $controller('pendingVisitsCtrl', {$scope: $rootScope.$new(true), $ionicPopup: mockIonicPopup, feedback: feedback
      });

    });
  });

  afterEach(function () {
    Meteor.myFunctions.groupVisitsByRequestedDate.restore();
  });

  describe('list settings', function () {
    it('show delete icon', function () {
      chai.assert.equal(controller.showDelete, false);
    });
    it('can swipe to delete', function () {
      chai.assert.equal(controller.canSwipe, true);
    });
  });

  describe('date since requested', function () {
    it('when requested date = now, time since requested = 0', function () {
      chai.assert.equal(controller.getTimeSinceRequested(new Date()), 'a few seconds ago');
    });
    it('when requested date = 5 days ago, time since requested = 5', function () {
      var date = new Date();
      date.setDate(date.getDate() - 5);
      chai.assert.equal(controller.getTimeSinceRequested(date), '5 days ago')
    });
    it('when date = 2 hours ago, time since requested = 2 hours', function () {
      var date = new Date();
      date.setTime(date.getTime() - ( 2 * 60 * 60 * 1000));
      chai.assert.equal(controller.getTimeSinceRequested(date), '2 hours ago')
    });
    it('when date = 15 minutes ago, time since requested = 15 minutes', function () {
      var date = new Date();
      date.setTime(date.getTime() - ( 15 * 60 * 1000));
      chai.assert.equal(controller.getTimeSinceRequested(date), '15 minutes ago')
    });
  });

  describe('cancel visit popup', function () {
    it('when the user cancels a visit the popup is displayed', function () {
      controller.showCancelVisitConfirm({visitor: '12341'});
      chai.assert(spyOnConfirm.calledOnce)
    })
  });

  describe('isToday', function () {
    it('returns true when date passed is today', function () {
      chai.assert(controller.isToday(new Date()));
    });
    it('returns false when date passed is tomorrow', function () {
      var date = new Date();
      date.setTime(date.getTime() + ( 24 * 60 * 60 * 1000));
      chai.assert.equal(controller.isToday(date), false);
    })
  });

});