/**
 * Created by n0235626 on 7/28/16.
 */
import 'angular-mocks';
import { Meteor } from 'meteor/meteor';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/feedback/visitor-feedback-list.component';
import '/model/users.js'

describe('Visitor Feedback List', function () {
  beforeEach(function () {
    window.module('visitry');
  });

  beforeEach(inject(function (_$controller_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  describe('FeedbackList', function () {
    var controller;
    var stateSpy;
    var userFindOneStub;
    var user;

    beforeEach(function () {
      user = {
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
                  lat : function() { return 42} , lng: function() { return -71 }
                }
              }
            }
          },
          visitRange: "20"
        }
      };

      inject(function ($rootScope, $ionicPopup, $state) {
        controller = $controller('visitorFeedbackList', {
          $scope: $rootScope.$new(true),
          $state: $state
        });
        stateSpy = sinon.stub($state, 'go');
        userFindOneStub = sinon.stub(User,'findOne');
      });
    });

    afterEach(function () {
      stateSpy.restore();
      User.findOne.restore();
    });

    describe('list settings', function () {
      it('show delete icon', function () {
        chai.assert.equal(controller.showDelete, false);
      });
      it('cannot swipe', function () {
        chai.assert.equal(controller.canSwipe, false);
      });
    });

    describe('Give Feedback',function(){
      it('give feedback for visit navigates user to feedback',function(){
        controller.giveFeedback(Random.id());
        chai.assert(stateSpy.calledWith('visitorFeedback'));
      });
    });

    describe('Get Requester',function(){
      beforeEach(function(){
        userFindOneStub.returns(user);
      });

      it('get requester returns user',function(){
        chai.assert.equal(controller.getRequester({requesterId:Random.id()}),user);
      })
    });

    describe('get Requester Image',function(){
      beforeEach(function(){
        userFindOneStub.returns(user);
      });

      it('requester image exists',function(){
        var picture= 'picture.png';
        user.userData.picture = picture;
        chai.assert.equal(controller.getRequesterImage({requesterId:Random.id()}),picture);
      });

      it('requester image does not exist',function(){
        chai.assert.equal(controller.getRequesterImage({requesterId:Random.id()}),"");
      })
    });
  });
});