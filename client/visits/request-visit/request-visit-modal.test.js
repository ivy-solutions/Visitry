import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/visits/request-visit/request-visit-modal.controller';
import '/client/visits/request-visit/request-visit-modal.service';
import { User } from '/model/users'

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
    inject(function ($rootScope) {
      controller = $controller('requestVisitModalCtrl', {$scope: $rootScope.$new(true)});
    });
  });
  afterEach( function() {
    User.findOne.restore();
  });


  describe('isLocationValid', function () {
    it('user has a location', function () {
      controller.userSubmitted = true;
      chai.assert.isTrue(controller.isLocationValid());
    });
    it('location field is blank', function () {
      controller.userSubmitted = true;
      controller.visitRequest.location.name = "";
      chai.assert.isFalse(controller.isLocationValid());
    });
  });

  describe('isDateValid', function () {
    it('no date', function () {
      controller.userSubmitted = true;
      controller.visitRequest.date = null;
      chai.assert.isFalse(controller.isDateValid());
    });
    it('date field is in past', function () {
      controller.userSubmitted = true;
      var pastDate = new Date();
      pastDate.setTime(0,0,0,0);
      controller.visitRequest.date = pastDate;
      chai.assert.isFalse(controller.isDateValid());
    });
    it('date is valid', function() {
      controller.userSubmitted = true;
      var tomorrow = new Date();
      tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));
      controller.visitRequest.date = tomorrow;
      chai.assert.isTrue(controller.isDateValid());
    });
  });

  describe( 'isTimeValid', function() {
    it('no time', function() {
      controller.userSubmitted = true;
      chai.assert.isFalse(controller.isTimeValid());
    });
    it('time = 9 is valid', function() {
      controller.userSubmitted = true;
      controller.visitRequest.time = 9;
      chai.assert.isTrue(controller.isTimeValid());
    });
  });

});