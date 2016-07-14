/**
 * Created by sarahcoletti on 6/10/16.
 */
/**
 * Created by n0235626 on 6/6/16.
 */
import 'angular-mocks';
import { Meteor } from 'meteor/meteor';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/visits/schedule-visit/schedule-visit-modal.component';

describe('Schedule Visit', function () {

  beforeEach(function () {
    angular.mock.module('visitry');
  });

  beforeEach(inject(function (_$controller_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  var controller;
  var spyOnAlert;
  var stateSpy;
  var meteorStub;

  beforeEach(function () {
    var mockIonicPopup = {
      alert: function(){}
    };
    spyOnAlert = sinon.spy(mockIonicPopup, 'alert');
    meteorStub = sinon.stub(Meteor, 'call');

    inject(function ($rootScope,$ionicPopup, $state) {
      controller = $controller('scheduleVisitModalCtrl', {
        $scope: $rootScope.$new(true),
        $ionicPopup: mockIonicPopup,
        $state: $state
      });
      stateSpy = sinon.stub($state, 'go');
    });
   });

  afterEach(function () {
    spyOnAlert.reset(true);
    meteorStub.restore();
  });


    describe('submit error handling', function () {
      var errorMsg;
      beforeEach(function () {
        var handleErrorStub = sinon.stub(controller, 'handleError', function(msg) { errorMsg = msg; } );
      });

      it('message if no time selected', function () {
        var visitWithNoDate = {};
        controller.submit(visitWithNoDate);
        chai.assert.equal( errorMsg, "Press schedule button to schedule visit.");
      });

      it('message if request for today', function () {
        controller.setSelectedTime(new Date());
        var visitWithTodaysDate = {requestedDate: new Date()};
        controller.submit(visitWithTodaysDate);
        chai.assert.equal( errorMsg, "Schedule Time must be in future.");
      });

      it('message if request for past date', function () {
        controller.setSelectedTime(new Date());
        var visitWithPastDate = {requestedDate: new Date(2016, 5, 1, 0, 0, 0, 0)};
        controller.submit(visitWithPastDate);
        chai.assert.equal( errorMsg, "Schedule Time must be in future.");
      });
    });

  describe('error brings up alert', function () {
    it('alert displayed when an error detected', function () {
      var visitWithNoDate = {};
      controller.submit(visitWithNoDate);
      chai.assert(spyOnAlert.calledOnce)
    })
  });

   describe( 'submit with valid date', function () {
     var tomorrow = new Date();
     tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));
     var visitWithDate = {_id: 'visitWithDate', requestedDate: tomorrow};
     var tenThirty = new Date(Date.UTC(2016, 5, 1, 10, 30, 0, 0));
     var expectedDate = new Date( tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(),
       tenThirty.getUTCHours(),tenThirty.getUTCMinutes(),0,0);

     it('submit with valid date, hides modal', function () {
       var modalHideStub = sinon.stub(controller, 'hideScheduleVisitModal');
       controller.setSelectedTime(tenThirty);
       controller.submit(visitWithDate);

       chai.assert(modalHideStub.called);
     });

     it ('submit with valid date, updates visitTime using requestedDate and selectedTime', function() {
       var modalHideStub = sinon.stub(controller, 'hideScheduleVisitModal');
       controller.setSelectedTime(tenThirty);
       controller.submit(visitWithDate);
       chai.assert(Meteor.call.calledWith('visits.scheduleVisit'),"visits.scheduleVisit called");
       chai.assert(Meteor.call.calledWith('visits.scheduleVisit','visitWithDate',expectedDate,""), "visits.scheduleVisit with correct arguments");
     });

     it('submit with valid date, updates visitor notes', function () {
       var modalHideStub = sinon.stub(controller, 'hideScheduleVisitModal');
       controller.setSelectedTime(tenThirty);
       controller.submit(visitWithDate);

       chai.assert(modalHideStub.called);
     });

     it('submit with valid date, state goes to /upcoming', function () {
       var modalHideStub = sinon.stub(controller, 'hideScheduleVisitModal');
       controller.setSelectedTime(tenThirty);
       controller.visitorNotes = "a note";
       controller.submit(visitWithDate);

       chai.assert(Meteor.call.calledWith('visits.scheduleVisit','visitWithDate',expectedDate,"a note"), "visits.scheduleVisit with correct arguments");
     });

   });

});