import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {assert} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/visits/request-visit/request-visit-modal.controller';
import '/client/visits/request-visit/request-visit-modal.service';
import '/model/users.js'

describe('Request Visit', function () {
  beforeEach(function () {
    angular.mock.module('visitry');
  });

  beforeEach(inject(function (_$controller_,_RequestVisit_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
    RequestVisit = _RequestVisit_;
  }));

  var controller;

  var findUserStub;
  var meteorCallStub;
  var requestVisitSpy;
  beforeEach(function () {
    requestVisitSpy = sinon.stub(RequestVisit, 'hideModal');
    meteorCallStub = sinon.stub(Meteor, 'call');
    findUserStub = sinon.stub(User, 'findOne');
    findUserStub.returns({
      username: 'Louise',
      userData: {
        location: {
          address: 'Boston',
          geo: {
            type: "Point",
            coordinates: [-71.0589, 42.3601]
          }
        }
      }
    });
    Meteor.isCordova=true
    inject(function ($rootScope) {
      controller = $controller('requestVisitModalCtrl', {$scope: $rootScope.$new(true)});
    });
  });

  afterEach( function() {
    User.findOne.restore();
    meteorCallStub.restore();
    Meteor.isCordova=false;
  });


  describe('isLocationValid ', function () {
    it('location is valid if when user has address in user profile', function () {
      controller.userSubmitted = true;
      assert.isTrue(controller.isLocationValid());
    });
    it('location is not valid when user types location with no coordinates', function () {
      controller.userSubmitted = true;
      controller.visitRequest.location = { name: "some name", details: { geometry: null} };
      assert.isFalse(controller.isLocationValid());
    });
    it('location field is blank', function () {
      controller.userSubmitted = true;
      controller.visitRequest.location.name = "";
      assert.isFalse(controller.isLocationValid());
    });
    it('location is valid when user selects location with coordinates', function () {
      controller.userSubmitted = true;
      controller.visitRequest.location = { name: "Acton", details: { geometry: [-71.477358, 42.468846]} };
      assert.isTrue(controller.isLocationValid());
    });
  });

  describe('isDateValid', function () {
    it('no date', function () {
      controller.userSubmitted = true;
      controller.visitRequest.date = null;
      assert.isFalse(controller.isDateValid());
    });
    it('date field is in past', function () {
      controller.userSubmitted = true;
      var pastDate = new Date();
      pastDate.setTime(0,0,0,0);
      controller.visitRequest.date = pastDate;
      assert.isFalse(controller.isDateValid());
    });
    it('date is valid', function() {
      controller.userSubmitted = true;
      var tomorrow = new Date();
      tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));
      controller.visitRequest.date = tomorrow;
      assert.isTrue(controller.isDateValid());
    });
  });

  describe( 'isTimeValid', function() {
    it('no time', function() {
      controller.userSubmitted = true;
      assert.isFalse(controller.isTimeValid());
    });
    it('time = 9 is valid', function() {
      controller.userSubmitted = true;
      controller.visitRequest.time = 9;
      assert.isTrue(controller.isTimeValid());
    });
    it('there is a fromVisit but it has no visitTime', function() {
      controller.userSubmitted = true;
      controller.fromVisit = {};
      assert.isFalse(controller.isTimeValid());
    });
    it('there is a fromVisit with visitTime', function() {
      var decDateAt9am = new Date(2017, 12, 30, 9, 0 ,0 ,0);
      controller.userSubmitted = true;
      controller.fromVisit = { visitTime: decDateAt9am};
      assert.isTrue(controller.isTimeValid());
    });
  });

  describe('getFullName',()=>{
    it('returns user first name and last name',()=>{
      let fullName =controller.getFullName({userData:{firstName:'daniel',lastName:'biales'}})
      assert.equal(fullName,'daniel biales')
    })
  });

  describe('onSelectUser',()=>{
    it('sets the requesterId for the visitRequest',()=>{
      controller.onSelectUser({_id:Random.id()});
      assert(controller.visitRequest.requesterId)
    });
    it('if user has a preferred address it sets the location name',()=>{
      controller.onSelectUser({_id:Random.id(),userData:{location:{address:'somewhere'}}})
      assert.equal(controller.visitRequest.location.name,'somewhere')
    })
  });

  describe('submit', ()=> {
    it('does submit if fromVisit provided',function () {
      controller.userSubmitted = true;
      controller.fromVisit = { visitTime: new Date(), visitorId: Random.id()};
      var tomorrow = new Date();
      tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));
      tomorrow.setHours(9);
      controller.visitRequest = {
        date: tomorrow,
        time: 0,
        location: {
          name: "someplace",
          details: {
          }
        }
      };
      assert.isTrue(controller.isLocationValid(), "location");
      assert.isTrue(controller.isDateValid(), "date");
      assert.isTrue(controller.isTimeValid(), "time");
      controller.submit();
      assert.isTrue(Meteor.call.calledWith('visits.createVisit'), 'create Visit call');
    });
    it('does submit if fromVisit not provided',function () {
      controller.userSubmitted = true;
      controller.fromVisit = null;
      var tomorrow = new Date();
      tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));
      controller.visitRequest = {
        date: tomorrow,
        time: 9,
        location: {
          name: "someplace",
          details: {
            geometry: {
              location: {
                lat: function () {
                  return 42
                }, lng: function () {
                  return -71
                }
              }
            }
          }
        }
      };
      assert.isTrue(controller.isLocationValid(), "location");
      assert.isTrue(controller.isDateValid(), "date");
      assert.isTrue(controller.isTimeValid(), "time");
      controller.submit();
      assert.isTrue(Meteor.call.calledWith('visits.createVisit'), 'create Visit call');
    });
    it('does not submit if no location',()=>{
      controller.userSubmitted = true;
      controller.visitRequest.location.name = "";
      assert.isFalse(controller.isLocationValid());
      controller.submit();
      assert.isFalse(Meteor.call.calledWith('visits.createVisit'));
    });
    it('does not submit if no date',()=>{
      controller.userSubmitted = true;
      controller.visitRequest.date = null;
      controller.visitRequest.location = { name: "Acton", details: { geometry: [-71.477358, 42.468846]} };
      assert.isTrue(controller.isLocationValid());
      assert.isFalse(controller.isDateValid());
      controller.submit();
      assert.isFalse(Meteor.call.calledWith('visits.createVisit'));
    });
    it('does not submit if no time',()=>{
      controller.userSubmitted = true;
      var tomorrow = new Date();
      tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));
      controller.visitRequest = { location : { name: "Acton", details: { geometry: [-71.477358, 42.468846]} },date : tomorrow};
      assert.isTrue(controller.isLocationValid(), "location");
      assert.isTrue(controller.isDateValid(), "date");
      assert.isFalse(controller.isTimeValid(), "time");
      controller.submit();
      assert.isFalse(Meteor.call.calledWith('visits.createVisit'));
    });
  });

});