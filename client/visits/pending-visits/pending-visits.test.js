/**
 * Created by n0235626 on 6/6/16.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/visits/pending-visits/pending-visits.controller';
import StubCollections from 'meteor/hwillson:stub-collections';
import Visits from '/model/visits.js'
import myFunctions from '/client/lib/sharedFunctions.js'

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
     StubCollections.add([Visits]);
    sinon.stub(Meteor.myFunctions, 'dateSortArray');

    var promise = {then: function(){}, error: function(){} };
    var mockIonicPopup = {
      confirm: function(){
        return promise;
      }
     };
    spyOnConfirm = sinon.spy(mockIonicPopup, 'confirm');
    inject(function ($rootScope,$ionicPopup) {
       controller = $controller('pendingVisitsCtrl', {$scope: $rootScope.$new(true), $ionicPopup: mockIonicPopup
      });

    });
  });

  afterEach(function () {
    StubCollections.restore();
    Meteor.myFunctions.dateSortArray.restore();
  });

  describe('list settings', function () {
    it('show delete icon', function () {
      chai.assert.equal(controller.showDelete, false);
    });
    it('can swipe to delete', function () {
      chai.assert.equal(controller.canSwipe, true);
    });
    it('list sorted descending by request day', function () {
      chai.assert.equal(controller.listSort.requestedDate, 1);
    })
  });

  describe('date since requested', function () {
    it('when date = now, time since requested = 0', function () {
      chai.assert.equal(controller.getTimeSinceRequested(new Date()), 0);
    });
    it('when date = 5 days from now, time since requested = 5', function () {
      var date = new Date();
      date.setDate(date.getDate() - 5);
      chai.assert.equal(controller.getTimeSinceRequested(date), 5)
    })
  });

  describe('cancel visit popup', function () {
    it('when the user cancels a visit the popup is displayed', function () {
      controller.showCancelVisitConfirm({visitor: '12341'});
      chai.assert(spyOnConfirm.calledOnce)
    })
  })

});