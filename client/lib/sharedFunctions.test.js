/**
 * Created by sarahcoletti on 6/16/16.
 */
import { Meteor } from 'meteor/meteor';
import {assert} from 'meteor/practicalmeteor:chai';
import '/client/lib/sharedFunctions.js';
import StubPackage from 'meteor/hwillson:stub-collections';
const StubCollections = StubPackage.default
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
      console.log(Meteor.userId.restore)
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

  describe("Roles", function () {
    let requesterUserAgency1Id;
    let requesterUserAgency2Id;
    let visitorUserAgency1Id;
    let visitorUserAgency2Id;
    let adminUserAgency1Id;
    let adminUserAgency2Id;
    let superUserId;
    let agency1Id = Random.id();
    let agency2Id = Random.id();

    beforeEach(function () {
      requesterUserAgency1Id = Meteor.users.insert({username: 'requesterUserAgency1'});
      Roles.setUserRoles(requesterUserAgency1Id, ['requester'], agency1Id);
      requesterUserAgency2Id = Meteor.users.insert({username: 'requesterUserAgency2'});
      Roles.setUserRoles(requesterUserAgency2Id, ['requester'], agency2Id);
      visitorUserAgency1Id = Meteor.users.insert({username: 'visitorUserAgency1'});
      Roles.setUserRoles(visitorUserAgency1Id, ['visitor'], agency1Id);
      visitorUserAgency2Id = Meteor.users.insert({username: 'visitorUserAgency2'});
      Roles.setUserRoles(visitorUserAgency2Id, ['visitor'], agency2Id);
      adminUserAgency1Id = Meteor.users.insert({username: 'adminUserAgency1'});
      Roles.setUserRoles(adminUserAgency1Id, ['administrator'], agency1Id);
      adminUserAgency2Id = Meteor.users.insert({username: 'adminUserAgency2'});
      Roles.setUserRoles(adminUserAgency2Id, ['administrator'], agency2Id);
      superUserId = Meteor.users.insert({username: 'clarkKent'});
      Roles.setUserRoles(superUserId, ['administrator'], 'allAgencies');
    });

    afterEach( function () {
      Meteor.users.remove(requesterUserAgency1Id);
      Meteor.users.remove(requesterUserAgency2Id);
      Meteor.users.remove(visitorUserAgency1Id);
      Meteor.users.remove(visitorUserAgency2Id);
      Meteor.users.remove(adminUserAgency1Id);
      Meteor.users.remove(requesterUserAgency1Id);
      Meteor.users.remove(adminUserAgency2Id);
      Meteor.users.remove(superUserId);
    });

    describe("isVisitor", function () {
      it("user with agency is visitor", function () {
        userIdStub.returns(visitorUserAgency1Id);
        assert.isTrue(Meteor.myFunctions.isVisitor());
      });
      it("user is not visitor", function () {
        userIdStub.returns(requesterUserAgency1Id);
        assert.isFalse(Meteor.myFunctions.isVisitor());
      });
    });

    describe("isRequester", function () {
      it("user with agency is requester", function () {
        userIdStub.returns(requesterUserAgency1Id);
        assert.isTrue(Meteor.myFunctions.isRequester());
      });
      it("user is not requester", function () {
        userIdStub.returns(visitorUserAgency1Id);
        assert.isFalse(Meteor.myFunctions.isRequester());
      });
    });

    describe("isAdministrator", ()=> {
      it("user with agency is administrator", ()=> {
        userIdStub.returns(adminUserAgency1Id);
        assert.isTrue(Meteor.myFunctions.isAdministrator());
      });
      it("user is not administrator", function () {
        userIdStub.returns(requesterUserAgency1Id);
        assert.isFalse(Meteor.myFunctions.isAdministrator());
      });
      it("superuser is administrator", function () {
        userIdStub.returns(superUserId);
        assert.isTrue(Meteor.myFunctions.isAdministrator());
      });
    });

    describe("isRequesterInAgency", function () {
      it("user is requester in agency1", function () {
        assert.isTrue(Meteor.myFunctions.isRequesterInAgency(requesterUserAgency1Id, agency1Id));
      });
      it("user is not requester in agency2", function () {
        assert.isFalse(Meteor.myFunctions.isRequesterInAgency(requesterUserAgency1Id, agency2Id));
      });
      it("user is not requester in agency1", function () {
        assert.isFalse(Meteor.myFunctions.isRequesterInAgency(requesterUserAgency2Id, agency1Id));
      });
      it("user is not requester", function () {
        assert.isFalse(Meteor.myFunctions.isRequesterInAgency(visitorUserAgency1Id, agency1Id));
      });
    });
    describe("isVisitorInAgency", function () {
      it("user is visitor in agency1", function () {
        assert.isTrue(Meteor.myFunctions.isVisitorInAgency(visitorUserAgency1Id, agency1Id));
      });
      it("user is not visitor in agency2", function () {
        assert.isFalse(Meteor.myFunctions.isVisitorInAgency(visitorUserAgency1Id, agency2Id));
      });
      it("user is not visitor in agency1", function () {
        assert.isFalse(Meteor.myFunctions.isVisitorInAgency(visitorUserAgency2Id, agency1Id));
      });
      it("user is not visitor", function () {
        assert.isFalse(Meteor.myFunctions.isVisitorInAgency(requesterUserAgency1Id, agency1Id));
      });
      it("user is visitor when no agencyId is passed", function () {
        assert.isTrue(Meteor.myFunctions.isVisitorInAgency(visitorUserAgency1Id, null));
      });
      it("user is not visitor when no agencyId is passed", function () {
        assert.isFalse(Meteor.myFunctions.isVisitorInAgency(requesterUserAgency1Id, null));
      });
    });
    describe("isAdministratorInAgency", function () {
      it("user is administrator in agency1", function () {
        assert.isTrue(Meteor.myFunctions.isAdministratorInAgency(adminUserAgency1Id, agency1Id));
      });
      it("user is not administrator in agency2", function () {
        assert.isFalse(Meteor.myFunctions.isAdministratorInAgency(adminUserAgency1Id, agency2Id));
      });
      it("user is not administrator in agency1", function () {
        assert.isFalse(Meteor.myFunctions.isAdministratorInAgency(adminUserAgency2Id, agency1Id));
      });
      it("user is not administrator", function () {
        assert.isFalse(Meteor.myFunctions.isAdministratorInAgency(requesterUserAgency1Id, agency1Id));
      });
    });
    describe( "administersMultipleAgencies", function() {
      it( "non-administrator returns false", function() {
        userIdStub.returns(visitorUserAgency1Id);
        assert.isFalse(Meteor.myFunctions.administersMultipleAgencies());
      });
      it( "administrator of 1 agency returns false", function() {
        userIdStub.returns(adminUserAgency1Id);
        assert.isFalse(Meteor.myFunctions.administersMultipleAgencies());
      });
      it( "administrator of 2 agencies returns true", function() {
        Roles.setUserRoles(adminUserAgency2Id, ['administrator'], agency1Id);
        userIdStub.returns(adminUserAgency2Id);
        assert.isTrue(Meteor.myFunctions.administersMultipleAgencies());
      });
      it( "super user returns true", function() {
        userIdStub.returns(superUserId);
        assert.isTrue(Meteor.myFunctions.administersMultipleAgencies());
      });
    })
  });
});
