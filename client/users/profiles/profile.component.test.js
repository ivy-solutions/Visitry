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

  beforeEach(function () {
    var fakeConfirmPopup = {then: function(){return true}, error: function(){} };
    var mockIonicPopup = {
      confirm: function(){
        return fakeConfirmPopup;
      }
    };
    meteorStub = sinon.stub(Meteor, 'call');

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
  });

  var user = {
    userName: "userName",
    userData: {
      firstName: "first",
      lastName: "last",
      role: "visitor",
      location: {
        name: "somewhere",
        details: {
          geometry: {
            location: {
              lat: "42", lng: "-71"
            }
          }
        }
      },
      vicinity: "20"
    }
  };

  describe( 'submitUpdate', function() {
    it('update Name', function () {
      controller.currentUser = user;
      controller.submitUpdate();
      chai.assert(Meteor.call.calledWith('updateName', 'first', 'last', 'visitor'),"updateName called");
    });
    it('update location', function () {
      controller.currentUser = user;
      controller.submitUpdate();
      chai.assert(Meteor.call.calledWith('updateLocation'),"updateLocation called");
    });
    it('visitor goes to browseRequests', function() {
      controller.currentUser = user;
      controller.submitUpdate();
      chai.assert(stateSpy.withArgs('browseRequests').calledOnce)
    });
    it('requester goes to pendingVisits', function() {
      user.userData.role = 'requester';
      controller.currentUser = user;
      controller.submitUpdate();
      chai.assert(stateSpy.withArgs('pendingVisits').calledOnce)
    });

  });

});