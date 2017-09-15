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

  beforeEach(inject(function (_$controller_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  var controller;

  var findUserStub;
  beforeEach(function () {
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
    Meteor.isCordova=false;
  });


  describe('isLocationValid', function () {
    it('user has a location', function () {
      controller.userSubmitted = true;
      assert.isTrue(controller.isLocationValid());
    });
    it('location field is blank', function () {
      controller.userSubmitted = true;
      controller.visitRequest.location.name = "";
      assert.isFalse(controller.isLocationValid());
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
      controller.userSubmitted = true;
      controller.fromVisit = { visitTime: new Date()};
      assert.isTrue(controller.isTimeValid());
    });
  });

  describe('getFullName',()=>{
    it('returns user first name and last name',()=>{
      let fullName =controller.getFullName({userData:{firstName:'daniel',lastName:'biales'}})
      assert.equal(fullName,'daniel biales')
    })
  })

  describe('onSelectUser',()=>{
    it('sets the requesterId for the visitRequest',()=>{
      controller.onSelectUser({_id:Random.id()})
      assert(controller.visitRequest.requesterId)
    })
    it('if user has a preferred address it sets the location name',()=>{
      controller.onSelectUser({_id:Random.id(),userData:{location:{address:'somewhere'}}})
      assert.equal(controller.visitRequest.location.name,'somewhere')
    })
  })

});