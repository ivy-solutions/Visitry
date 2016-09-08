/**
 * Created by sarahcoletti on 6/21/16.
 */
import 'angular-mocks';
import { Meteor } from 'meteor/meteor';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/users/profiles/profile.component.js';

describe ( 'Profile', function() {

  beforeEach(function () {
    angular.mock.module('visitry');
  });

  beforeEach(inject(function (_$controller_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  var controller;
  var stateSpy;
  var meteorStub;
  var form;
  var userIdStub;

  beforeEach(function () {
    form = { $valid: true,
      location : {$pristine: true, $touched: false},
      phoneNumber : {$pristine: true, $touched: false},
      $setUntouched: function(){},
      $setPristine: function(){}
    };
    var fakeConfirmPopup = {then: function(){return true}, error: function(){} };
    var mockIonicPopup = {
      confirm: function(){
        return fakeConfirmPopup;
      }
    };
    meteorStub = sinon.stub(Meteor, 'call');
    userIdStub = sinon.stub(Meteor, 'userId');
    userIdStub.returns('someUserId');

    inject(function ($rootScope, $ionicPopup, $state) {
      controller = $controller('profileCtrl', {
        $scope: $rootScope.$new(true),
        $ionicPopup: mockIonicPopup,
        $state: $state
      });
      stateSpy = sinon.stub($state, 'go');
    });
   });

  afterEach(function () {
    meteorStub.restore();
    userIdStub.restore();
  });

  var user = {
    userName: "userName",
    userData: {
      firstName: "first",
      lastName: "last",
      role: "visitor",
      location: {
        address: "somewhere",
        details: {
          geometry: {
            location: {
              lat : function() { return 42} , lng: function() { return -71 }
            }
          }
        }
      },
      visitRange: "20"
    }
  };

  describe( 'submitUpdate', function() {
    it('update UserData', function () {
      controller.currentUser = user;
      controller.distance = "17";
      controller.isVisitor = true;
      controller.phoneNumber = "(800) 555-1212";
      controller.submitUpdate(form);
      chai.assert.isTrue(Meteor.call.calledWith('updateUserData'),"updateUserData called");
    });
    it('update location visitorLocation when a location is selected', function () {
      controller.currentUser = user;
      form.location.$touched = true;
      controller.locationDetails = {
        name: "Boston",
        geometry: {
          location: {
            lat : function() { return 42} , lng: function() { return -71 }
          }
        }
      };
      controller.submitUpdate(form);
      chai.assert.isTrue(Meteor.call.calledWith('updateLocation'),"updateLocation called");
    });
    it('does not update location, when invalid location', function () {
      user.userData.location.address = "some text";
      controller.locationDetails = null;
      controller.currentUser = user;
      controller.submitUpdate(form);
      chai.assert.isFalse(Meteor.call.calledWith('updateLocation'),"updateLocation not called");
    });
    it('does not update location, when none provided', function () {
      user.userData.location.address = "";
      controller.locationDetails = null;
      controller.currentUser = user;
      controller.submitUpdate(form);
      chai.assert.isFalse(Meteor.call.calledWith('updateLocation'),"updateLocation not called");
    });
    it('does not update location, when location exists and is unedited', function () {
      user.userData.location  = { name: "some place", latitude: 42, longitude:-71 };
      controller.currentUser = user;
      controller.submitUpdate(form);
      chai.assert.isFalse(Meteor.call.calledWith('updateLocation'),"updateLocation not called");
    });
  });

  describe( 'submitSuccess', function() {
    it('visitor goes to browseRequests', function() {
      meteorStub.returns(); //no error
      controller.currentUser = user;
      controller.submitSuccess(form);
      chai.assert.isTrue(stateSpy.withArgs('browseRequests').calledOnce)
    });
    it('requester goes to pendingVisits', function() {
      user.userData.role = 'requester';
      controller.currentUser = user;
      controller.submitSuccess(form);
      chai.assert.isTrue(stateSpy.withArgs('pendingVisits').calledOnce)
    });

  });

  describe('isLocationValid', function() {
    it( 'true when user has selected a location', function(){
      controller.currentUser = user;
      controller.locationDetails = {
        name: "Boston",
          geometry: {
          location: {
            lat : function() { return 42} , lng: function() { return -71 }
          }
        }
      };
      user.userData.location.address ="Boston";
      chai.assert.isTrue(controller.isLocationValid());
    });
    it ( 'true when the location is blank', function() {
      controller.currentUser = user;
      controller.locationDetails = null;
      user.userData.location.address = null;
      chai.assert.isTrue(controller.isLocationValid());
    });
    it ( 'false when location details is blank but location has text', function() {
      controller.currentUser = user;
      controller.locationDetails = null;
      user.userData.location.address = "text";
      chai.assert.isFalse(controller.isLocationValid());
    });
    it ( 'false when location details is blank but location has text', function() {
      controller.currentUser = user;
      controller.locationDetails = {
        name: "Boston",
        geometry: {
          location: {
            lat: function () {
              return 42
            }, lng: function () {
              return -71
            }
          }
        }
      };
      user.userData.location.address = "";
      chai.assert.isFalse(controller.isLocationValid());
    });
  });
});