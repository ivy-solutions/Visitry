/**
 * Created by sarahcoletti on 6/14/16.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/visits/visit-details/visit-details.controller';
import '/client/visits/schedule-visit/schedule-visit-modal.service';

describe('View Visit Details', function () {

  beforeEach(function () {
    angular.mock.module('visitry');
  });

  beforeEach(inject(function (_$controller_,_ScheduleVisit_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
    ScheduleVisit = _ScheduleVisit_;
  }));

  var controller;
  var findOneStub;
  var userIdStub;
  var userIsInRoleStub;
  let scheduleVisitSpy;
  var spyOnConfirm;

  beforeEach(function () {
    findOneStub = sinon.stub(User, 'findOne');
    userIdStub = sinon.stub(Meteor, 'userId');
    userIsInRoleStub = sinon.stub(Roles, 'userIsInRole');
    scheduleVisitSpy = sinon.spy(ScheduleVisit, 'showModal');
    var promise = {then: function(){}, error: function(){} };
    var mockIonicPopup = {
      confirm: function(){
        return promise;
      }
    };
    spyOnConfirm = sinon.spy(mockIonicPopup, 'confirm');
    inject(function ($rootScope, $state,$ionicPopup) {
      controller = $controller('visitDetailsCtrl', {
        $scope: $rootScope.$new(true),
        $state: $state,
        $ionicPopup: mockIonicPopup
      });
    });
    findOneStub.returns({userData: {firstName: "Victoria", picture: "Victoria's picture"}});
    controller.requester = {userData: {firstName: "Requester", picture: "Requester's picture"}};
  });

  afterEach(function () {
    User.findOne.restore();
    Meteor.userId.restore();
    Roles.userIsInRole.restore();
  });

  describe("isVisitor", function () {
    it("user is visitor", function () {
      userIdStub.returns("someUserId");
      userIsInRoleStub.returns(true);
      chai.assert.isTrue(controller.isVisitor());
    });
    it("user is not visitor", function () {
      userIdStub.returns('someUserId');
      userIsInRoleStub.returns(false);
      chai.assert.isFalse(controller.isVisitor());
    });
  });

  describe("isRequester", function () {
    it("user is requester", function () {
      userIdStub.returns("someUserId");
      userIsInRoleStub.returns(true);
      chai.assert.isTrue(controller.isRequester());
    });
    it("user is not requester", function () {
      userIdStub.returns("someUserId");
      userIsInRoleStub.returns(false);
      chai.assert.isFalse(controller.isRequester());
    });
  });

  describe("canEdit", function() {
    it("only if user is requester", function() {
      userIdStub.returns("someUserId");
      controller.visit = {requesterId: 'requesterId'};
      chai.assert.isFalse(controller.canEdit());
    });
    it("only if unscheduled", function() {
      controller.visit = {requesterId: Meteor.userId(), visitorId:"visitorId"};
      chai.assert.isFalse(controller.canEdit());
    });
    it("if unscheduled and user is requester", function() {
      userIdStub.returns("someUserId");
      controller.visit = {requesterId: "someUserId"};
      chai.assert.isTrue(controller.canEdit());
    });
  });

  describe("canCallRequester", function () {
    it("user is visitor and has a phone number", function () {
      userIdStub.returns("someUserId");
      userIsInRoleStub.returns(true);
      controller.requester.userData.phoneNumber = "+15551212";
      controller.visit = {requesterId: 'requesterId', visitorId: Meteor.userId()};
      chai.assert.isTrue(controller.canCallRequester());
    });
    it("user is visitor with no phone number", function () {
      userIdStub.returns("someUserId");
      userIsInRoleStub.returns(true);
      controller.visit = {requesterId: 'requesterId', visitorId: Meteor.userId()};
      chai.assert.isFalse(controller.canCallRequester());
    });
    it("user is visitor but the visit is not yet scheduled", function () {
      userIdStub.returns("someUserId");
      userIsInRoleStub.returns(true);
      controller.visit = {requesterId: 'requesterId'};
      chai.assert.isFalse(controller.canCallRequester());
    });
    it("user is the requester", function () {
      userIdStub.returns("someUserId");
      userIsInRoleStub.returns(false);
      controller.visit = {requesterId: Meteor.userId(), visitorId: 'visitorId'};
      chai.assert.isFalse(controller.canCallRequester());
    });
  });

  describe("canCallVisitor", function () {
    it("user is requester for the visit and has a phone number", function () {
      userIdStub.returns("someUserId");
      userIsInRoleStub.returns(true);
      findOneStub.returns({userData: {firstName: "Victoria", picture: "Victoria's picture", phoneNumber: "+15551212"}})
      controller.visit = {requesterId: Meteor.userId(), visitorId: 'visitorId'};
      chai.assert.isTrue(controller.canCallVisitor());
    });
    it("user is the requester for the visit but does not have a phone number", function () {
      userIdStub.returns("someUserId");
      userIsInRoleStub.returns(true);
      controller.visit = {requesterId: Meteor.userId(), visitorId: 'someOtherId'};
      chai.assert.isFalse(controller.canCallVisitor());
    });
    it("user is the requester for the visit but the visit has not been scheduled", function () {
      userIdStub.returns("someUserId");
      userIsInRoleStub.returns(true);
      controller.visit = {requesterId: 'visitorId'};
      chai.assert.isFalse(controller.canCallVisitor());
    });
    it("user is a visitor", function () {
      userIdStub.returns("someUserId");
      userIsInRoleStub.returns(false);
      controller.visit = {requesterId: 'requesterId', visitorId: Meteor.userId()};
      chai.assert.isFalse(controller.canCallVisitor());
    });
  });

  describe("getRequesterImage", function () {
    it("if requester has a picture", function () {
      controller.visit = {requesterId: Meteor.userId()};
      chai.assert.equal(controller.getRequesterImage(), "Requester's picture");
    });
    it("if requester has no picture", function () {
      controller.visit = {requesterId: Meteor.userId()};
      controller.requester = {};
      chai.assert.equal(controller.getRequesterImage(), "");
    });
  });

  describe("getVisitorImage", function () {
    it("if visitor has a picture", function () {
      controller.visit = {requesterId: Meteor.userId(), visitorId: "visitor"};
      chai.assert.equal(controller.getVisitorImage(), "Victoria's picture");
    });
    it("if there is no visitor", function () {
      controller.visit = {requesterId: Meteor.userId()};
      chai.assert.equal(controller.getVisitorImage(), "");
    });
    it("if visitor has no picture", function () {
      controller.visit = {requesterId: Meteor.userId(), visitorId: "visitor"};
      findOneStub.returns({userData: {firstName: "No face"}});
      chai.assert.equal(controller.getVisitorImage(), "");
    });
  });

  describe("user about info", function () {
    var user;
    beforeEach(function () {
      user = {
        userData: {}
      }
    });
    afterEach(function () {
      user = null;
    });
    it('user has about info', function () {
      user.userData.about = 'This is about the user';
      chai.assert.isString(controller.userAboutInfo(user), 'This is about the user');
    });
    it('user does not have about info', function () {
      chai.assert.isString(controller.userAboutInfo(user), '');
    });
  });

  describe('sheduleVisit', function () {
    it('schedule visit displays modal', function () {
      controller.scheduleVisit();
      chai.assert.isTrue(scheduleVisitSpy.called);
    });
  });

  describe('cancel visit popup', function () {
    beforeEach(function(){
      controller.visit={visitor: '12341'};
    });

    it('when the user cancels a visit the popup is displayed', function () {
      controller.cancelVisit();
      chai.assert(spyOnConfirm.calledOnce)
    })
  });


});
