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

  describe( "hasAboutInfo", function () {
    it( "has interests true", function() {
      var userWith = {userData: {firstName: "Alfonso", interests: ["mountain climbing", "writing symphonies", "studying Urdu"]}};
       chai.assert(controller.hasAboutInfo(userWith));
    });
    it( "has no interests", function() {
      var userWithout = {userData: {firstName: "Boring"}};
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
