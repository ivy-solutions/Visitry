/**
 * Created by sarahcoletti on 6/14/16.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { User } from '/model/users'
import '/client/visits/visit-details/visit-details.controller';


describe('View Visit Details', function () {

  beforeEach(function () {
    angular.mock.module('visitry');
  });

  beforeEach(inject(function (_$controller_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  var controller;
  var findOneStub;

  beforeEach(function () {
    findOneStub = sinon.stub(User, 'findOne');
    inject(function ($rootScope, $state) {
      controller = $controller('visitDetailsCtrl', {
        $scope: $rootScope.$new(true),
        $state: $state
      });
    });
    findOneStub.returns( { userData: { firstName: "Victoria", picture: "Victoria's picture"} });
    controller.requester = { userData: { firstName: "Requester", picture: "Requester's picture"} };
  });

  afterEach(function () {
    User.findOne.restore();
  });

  describe( "isVisitor", function () {
    it( "is true", function() {
      controller.visit = {visitorId : Meteor.userId()};
      chai.assert(controller.isVisitor);
    });
    it( "visitor is someone else", function() {
      controller.visit = {visitorId : 'someOtherUser'};
      chai.assert(controller.isVisitor, false);
    });
    it( "no visitor", function() {
      controller.visit = {};
      chai.assert(controller.isVisitor, false);
    });
  });

  describe( "isRequester", function () {
    it( "is true", function() {
      controller.visit = {requesterId : Meteor.userId()};
      chai.assert(controller.isRequester);
    });
    it( "requester is someone else", function() {
      controller.visit = {requesterId : 'someOtherUser'};
      chai.assert(controller.isRequester, false);
    });
  });

  describe( "getBuddy", function () {
    it( "if user is requester returns visitor", function() {
      controller.visit = {requesterId : Meteor.userId(), visitorId: "visitor"};
      chai.assert.equal(controller.getBuddy().userData.firstName, 'Victoria');
    });
    it( "if visit has no visitor yet returns requester", function() {
      controller.requester = { name: "Requester" };
      controller.visit = {requesterId : Meteor.userId(), visitorId: null };
      chai.assert.equal(controller.getBuddy().name, 'Requester');
    });
    it( "if user is visitor returns requester", function() {
      controller.requester = { name: "Requester" };
      controller.visit = {requesterId : "someone", visitorId: Meteor.userId() };
      chai.assert.equal(controller.getBuddy().name, 'Requester');
    });
  });

  describe( "getBuddyImage", function () {
    it( "if user is requester returns visitor", function() {
      controller.visit = {requesterId : Meteor.userId(), visitorId: "visitor"};
      chai.assert.equal(controller.getBuddyImage(), "Victoria's picture");
    });
    it( "if visit has no visitor yet returns requester", function() {
      controller.visit = {requesterId : Meteor.userId(), visitorId: null };
      chai.assert.equal(controller.getBuddyImage(), "Requester's picture");
    });
    it( "if user is visitor returns requester", function() {
      controller.visit = {requesterId : "someone", visitorId: Meteor.userId() };
      chai.assert.equal(controller.getBuddyImage(), "Requester's picture");
    });
  });

  describe( "getRequesterImage", function () {
    it( "if requester has a picture", function() {
      controller.visit = {requesterId : Meteor.userId()};
      chai.assert.equal(controller.getRequesterImage(), "Requester's picture");
    });
    it( "if requester has no picture", function() {
      controller.visit = {requesterId : Meteor.userId()};
      controller.requester = { };
      chai.assert.equal(controller.getRequesterImage(), "");
    });
  });

  describe( "getVisitorImage", function () {
    it( "if visitor has a picture", function() {
      controller.visit = {requesterId : Meteor.userId(), visitorId: "visitor"};
      chai.assert.equal(controller.getVisitorImage(), "Victoria's picture");
    });
    it( "if there is no visitor", function() {
      controller.visit = {requesterId : Meteor.userId()};
      chai.assert.equal(controller.getVisitorImage(), "");
    });
    it( "if visitor has no picture", function() {
      controller.visit = {requesterId : Meteor.userId(), visitorId: "visitor"};
      findOneStub.returns( {userData: {firstName: "No face"}} );
      chai.assert.equal(controller.getVisitorImage(), "");
    });
  });

});
