/**
 * Created by sarahcoletti on 6/14/16.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/visits/visitor-view-upcoming/visitor-view-upcoming.component';

describe('View Upcoming Visits Visit', function () {

  beforeEach(function () {
    angular.mock.module('visitry');
  });

  beforeEach(inject(function (_$controller_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  var controller;
  var spyOnConfirm;
  var stateSpy;

  beforeEach(function () {
    var fakeConfirmPopup = {then: function(){return true}, error: function(){} };
    var mockIonicPopup = {
      confirm: function(){
        return fakeConfirmPopup;
      }
    };
    spyOnConfirm = sinon.spy(mockIonicPopup, 'confirm');

    inject(function ($rootScope, $ionicPopup, $state) {
      controller = $controller('visitorViewUpcomingCtrl', {
        $scope: $rootScope.$new(true),
        $ionicPopup: mockIonicPopup,
        $state: $state
      });
      stateSpy = sinon.stub($state, 'go');
    });
  });

  afterEach(function () {
    spyOnConfirm.reset(true);
    stateSpy.restore();
  });

  describe('Cancel Visit', function () {
    it('cancel brings up confirm', function () {
      var scheduledVisit = { _id: 'fakeVisit', requesterId: 'requester', visitorId: 'visitor', visitTime: new Date()};
      controller.cancelVisit(scheduledVisit);
      chai.assert(spyOnConfirm.calledOnce);
    });
   });

  describe('VisitDetails', function () {
    it('visit details, state goes to /visitDetails', function () {
      controller.visitDetails('visitId');
      chai.assert(stateSpy.calledOnce);
      chai.assert(stateSpy.withArgs('visitDetails', {visitId: "visitId"}).calledOnce)
    });
  });


});

