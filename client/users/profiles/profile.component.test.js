/**
 * Created by sarahcoletti on 6/21/16.
 */
import 'angular-mocks';
import { Meteor } from 'meteor/meteor';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/users/profiles/profile.component.js';
import '/client/users/profiles/edit-registration-modal.controller';
import '/client/users/profiles/edit-registration-modal.service';

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
  var user;

  beforeEach(function () {
    form = { $valid: true,
      location : {$pristine: true, $dirty: false},
      phoneNumber : {$pristine: true, $dirty: false},
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
    user = {
      userName: "userName",
      roles: ["visitor"],
      emails: [{address: 'abc@someplace.com', verified:false}],
      userData: {
        firstName: "first",
        lastName: "last",
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
        locationInfo: "Apt.3B",
        visitRange: "20"
      }
    };
   });

  afterEach(function () {
    meteorStub.restore();
    userIdStub.restore();
    if (stateSpy) stateSpy.restore();
  });


  describe( 'submitUpdate', function() {
    it('update UserData', function () {
      controller.currentUser = user;
      controller.distance = "17";
      controller.phoneNumber = "(800) 555-1212";
      controller.submitUpdate(form);
      chai.assert.isTrue(Meteor.call.calledWith('updateUserData'),"updateUserData called");
    });
    it('update location visitorLocation when a location is selected', function () {
      controller.currentUser = user;
      form.location.$dirty = true;
      controller.location.details = {
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
    it ( 'false when no location details but location has text', function() {
      controller.currentUser = user;
      controller.location.details = null;
      controller.location.address = "text";
      chai.assert.isFalse(controller.isLocationValid());
    });
    it ( 'true when location details is filled in but location is empty', function() {
      controller.currentUser = user;
      controller.location.details = {
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
      controller.location.address = "";
      chai.assert.isTrue(controller.isLocationValid());
    });
  });
});