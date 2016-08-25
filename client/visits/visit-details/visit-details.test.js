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
  var userIdStub;

  beforeEach(function () {
    findOneStub = sinon.stub(User, 'findOne');
    userIdStub = sinon.stub(Meteor, 'userId');
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
    Meteor.userId.restore();
  });

  describe( "isVisitor", function () {
    it( "is true", function() {
      userIdStub.returns( "someUserId")
      controller.visit = {visitorId : "someUserId"};
      chai.assert.isTrue(controller.isVisitor() );
    });
    it( "visitor is someone else", function() {
      controller.visit = {visitorId : 'someOtherUser'};
      chai.assert.isFalse(controller.isVisitor());
    });
    it( "no visitor", function() {
      controller.visit = {};
      chai.assert.isFalse(controller.isVisitor());
    });
  });

  describe( "isRequester", function () {
    it( "is true", function() {
      controller.visit = {requesterId : Meteor.userId()};
      chai.assert.isTrue(controller.isRequester());
    });
    it( "requester is someone else", function() {
      controller.visit = {requesterId : 'someOtherUser'};
      chai.assert.isFalse(controller.isRequester());
    });
  });

  describe( "canCallRequester", function () {
    it( "is true", function() {
      controller.requester.userData.phoneNumber = "+15551212";
      controller.visit = {requesterId : 'requesterId', visitorId: Meteor.userId()};
      chai.assert.isTrue(controller.canCallRequester());
    });
    it( "requester has no phone number", function() {
      controller.visit = {requesterId : 'requesterId', visitorId: Meteor.userId()};
      chai.assert.isFalse(controller.canCallRequester());
    });
    it( "visit is not yet scheduled", function() {
      controller.visit = {requesterId : 'requesterId'};
      chai.assert.isFalse(controller.canCallRequester());
    });
    it( "user is the requester", function() {
      controller.visit = {requesterId : Meteor.userId(), visitorId: 'visitorId'};
      chai.assert.isFalse(controller.canCallRequester());
    });
  });

  describe( "canCallVisitor", function () {
    it( "is true", function() {
      findOneStub.returns({ userData: { firstName: "Victoria", picture: "Victoria's picture", phoneNumber: "+15551212"} })
      controller.visit = {requesterId : Meteor.userId(), visitorId: 'visitorId'};
      chai.assert.isTrue(controller.canCallVisitor());
    });
    it( "visitor has no phone number", function() {
      controller.visit = {requesterId : Meteor.userId(), visitorId: 'someOtherId'};
      chai.assert.isFalse(controller.canCallVisitor());
    });
    it( "visit is not yet scheduled", function() {
      controller.visit = {requesterId : 'visitorId'};
      chai.assert.isFalse(controller.canCallVisitor());
    });
    it( "user is the visitor", function() {
      controller.visit = {requesterId : 'requesterId', visitorId: Meteor.userId()};
      chai.assert.isFalse(controller.canCallVisitor());
    });
  });

  describe( "hasAboutInfo", function () {
    it( "user has about info", function() {
      var userWith = {userData: {firstName: "Alfonso", about: "I enjoy mountain climbing, writing symphonies and studying Urdu."}};
       chai.assert(controller.hasAboutInfo(userWith));
    });
    it( "has no about info", function() {
      var userWithout = {userData: {firstName: "Boring"}};
      chai.assert.isFalse(controller.hasAboutInfo(userWithout));
    });
    it( "has empty about info", function() {
      var userWithout = {userData: {firstName: "Empty", about:""}};
      chai.assert.isFalse(controller.hasAboutInfo(userWithout));
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
