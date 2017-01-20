/**
 * Created by sarahcoletti on 6/16/16.
 */
import { Meteor } from 'meteor/meteor';
import {assert} from 'meteor/practicalmeteor:chai';
import '/client/lib/sharedFunctions.js';
import StubCollections from 'meteor/hwillson:stub-collections';
import '/model/users.js'
import { Roles } from 'meteor/alanning:roles'

describe('SharedFunctions', function () {

  let tomorrow = new Date();
  tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));
  let yesterday = new Date();
  yesterday.setTime(yesterday.getTime() - ( 24 * 60 * 60 * 1000));
  const futureVisitRequest = {requestedDate: tomorrow};
  const pastVisitRequest = {requestedDate: yesterday};
  const sameDayFutureVisitRequest = {requestedDate: new Date(futureVisitRequest.requestedDate)};
  var today = new Date();
  const nowVisitRequest = {requestedDate: today};
  let todayAt9 = new Date(today);
  todayAt9.setHours(9, 0, 0, 0);
  const todayAt9VisitRequest = {requestedDate: todayAt9};

  let user;
  let testUserId;
  let userIdStub;

  beforeEach(function () {
    StubCollections.stub(Meteor.users);
    userIdStub = sinon.stub(Meteor, 'userId');
  });
  afterEach(function () {
    Meteor.userId.restore();
    StubCollections.restore();
  });

  describe('groupVisitsByRequestedDate', function () {
    it('groups by requestedDate into 3 groups', function () {
      var dateGroupedArray = Meteor.myFunctions.groupVisitsByRequestedDate([pastVisitRequest, todayAt9VisitRequest, nowVisitRequest, futureVisitRequest, sameDayFutureVisitRequest]);
      assert.equal(3, dateGroupedArray.length, "Grouped by yesterday, today, tomorrow");
      assert.equal(1, dateGroupedArray[0].visits.length, "yesterday");
      assert.equal(pastVisitRequest.requestedDate, dateGroupedArray[0].visits[0].requestedDate, "pastVisitRequest");
      assert.equal(2, dateGroupedArray[1].visits.length, "Today");
      assert.equal(2, dateGroupedArray[2].visits.length, "Tomorrow");
    })
  });

  describe('getUser', function () {
    beforeEach(function(){
      testUserId = Meteor.users.insert({username:'testUser'});
    });
    it('getUser returns userData', function () {
      var userData = Meteor.myFunctions.getUser(testUserId);
      assert.isNotNull(userData);
      assert.equal(userData.username, "testUser");
    });
    it('getUser returns null when no id', function () {
      var userData = Meteor.myFunctions.getUser();
      assert.isNull(userData);
    })
  });

  describe('getUserImage', function () {
    let userWithPictureId;
    let userWithNoPictureId;
    beforeEach(function(){
      userWithPictureId=Meteor.users.insert({username: "test", userData: {"picture": "pic"}});
      userWithNoPictureId=Meteor.users.insert({_id: "123", username: "test", userData: {"picture": ""}});
    });
    it('getUserImage returns image', function () {
      var userImage = Meteor.myFunctions.getUserImage(userWithPictureId);
      assert.equal(userImage, "pic");
    });
    it('getUserImage returns empty string if user is not found', function () {
      var userImage = Meteor.myFunctions.getUserImage('321');
      assert.equal(userImage, "");
    });
    it('getUserImage returns empty string if user does not have a picture', function () {
      var userImage = Meteor.myFunctions.getUserImage(userWithNoPictureId);
      assert.equal(userImage, "");
    });
  });

  describe('showCanceledVisitConfirm', function () {
    //FIXME: I don't know how to test this because I have to pass in $filter, $ionicListDelegate,
    // $ionicHistory. I know I can mock $ionicPopup but I don't know how to mock the other things
  });

  describe("isVisitor", function () {
    let userWithVisitorRoleId;
    let userWithoutVisitorRoleId;
    beforeEach(function(){
      userWithVisitorRoleId = Meteor.users.insert({username:'visitorUser',roles:['visitor']});
      userWithoutVisitorRoleId = Meteor.users.insert({username:'nonVisitorUser',roles:['requester']});
    });
    it("user is visitor", function () {
      userIdStub.returns(userWithVisitorRoleId);
      assert.isTrue(Meteor.myFunctions.isVisitor());
    });
    it("user is not visitor", function () {
      userIdStub.returns(userWithoutVisitorRoleId);
      assert.isFalse(Meteor.myFunctions.isVisitor());
    });
  });

  describe("isRequester", function () {
    let userWithRequesterRoleId;
    let userWithoutRequesterRoleId;
    beforeEach(function(){
      userWithRequesterRoleId = Meteor.users.insert({username:'visitorUser',roles:['requester']});
      userWithoutRequesterRoleId = Meteor.users.insert({username:'nonVisitorUser',roles:['visitor']});
    });
    it("user is requester", function () {
      userIdStub.returns(userWithRequesterRoleId);
      assert.isTrue(Meteor.myFunctions.isRequester());
    });
    it("user is not requester", function () {
      userIdStub.returns(userWithoutRequesterRoleId);
      assert.isFalse(Meteor.myFunctions.isRequester());
    });
  });

  describe("isAdministrator", ()=> {
    let userWithAdministratorRoleId;
    let userWithoutAdministratorRoleId;
    beforeEach(function(){
      userWithAdministratorRoleId = Meteor.users.insert({username:'visitorUser',roles:['administrator']});
      userWithoutAdministratorRoleId = Meteor.users.insert({username:'nonVisitorUser',roles:['visitor']});
    });
    it("user is administrator", ()=> {
      userIdStub.returns(userWithAdministratorRoleId);
      assert.isTrue(Meteor.myFunctions.isAdministrator());
    });
    it("user is not administrator", function () {
      userIdStub.returns(userWithoutAdministratorRoleId);
      assert.isFalse(Meteor.myFunctions.isAdministrator());
    });
  })

});
