/**
 * Created by sarahcoletti on 6/16/16.
 */
import {chai} from 'meteor/practicalmeteor:chai';
import '/client/lib/sharedFunctions.js';
import StubCollections from 'meteor/hwillson:stub-collections';
import '/model/users.js'

describe('SharedFunctions', function () {

  var tomorrow = new Date();
  tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));
  var yesterday = new Date();
  yesterday.setTime(yesterday.getTime() - ( 24 * 60 * 60 * 1000));
  const futureVisitRequest = {requestedDate: tomorrow};
  const pastVisitRequest = {requestedDate: yesterday};
  const sameDayFutureVisitRequest = {requestedDate: new Date(futureVisitRequest.requestedDate)};
  var today = new Date()
  const nowVisitRequest = {requestedDate: today};
  var todayAt9 = new Date(today);
  todayAt9.setHours(9, 0, 0, 0)
  const todayAt9VisitRequest = {requestedDate: todayAt9};

  var findOneStub;
  var user;

  beforeEach(function () {
    findOneStub = sinon.stub(User, 'findOne', function (selector) {
      if (selector._id === "123") {
        return {_id: "123", username: "test", userData: {"picture": "pic"}}
      }
        else if(selector._id==="nopic"){
        return {_id: "123", username: "test", userData: {"picture": ""}}
      }
      else {
        return null
      }
    });
  });
  afterEach(function () {
    User.findOne.restore();
  });

  describe('groupVisitsByRequestedDate', function () {
    it('groups by requestedDate into 3 groups', function () {
      var dateGroupedArray = Meteor.myFunctions.groupVisitsByRequestedDate([pastVisitRequest, todayAt9VisitRequest, nowVisitRequest, futureVisitRequest, sameDayFutureVisitRequest]);
      console.log(JSON.stringify(dateGroupedArray));
      chai.assert.equal(3, dateGroupedArray.length, "Grouped by yesterday, today, tomorrow");
      chai.assert.equal(1, dateGroupedArray[0].visits.length, "yesterday");
      chai.assert.equal(pastVisitRequest.requestedDate, dateGroupedArray[0].visits[0].requestedDate, "pastVisitRequest");
      chai.assert.equal(2, dateGroupedArray[1].visits.length, "Today");
      chai.assert.equal(2, dateGroupedArray[2].visits.length, "Tomorrow");
    })
  });

  describe('getUser', function () {
    it('getUser returns userData', function () {
      var userData = Meteor.myFunctions.getUser("123");
      chai.assert.isNotNull(userData);
      chai.assert.equal(userData._id, "123");
    });
    it('getUser returns null when invalid id', function () {
      var userData = Meteor.myFunctions.getUser("321");
      chai.assert.isNull(userData);
    })
  });

  describe('getUserImage', function () {
    it('getUserImage returns image', function () {
      var userImage = Meteor.myFunctions.getUserImage("123");
      chai.assert.equal(userImage, "pic");
    });
    it('getUserImage returns empty string if user is not found', function () {
      var userImage = Meteor.myFunctions.getUserImage("321");
      chai.assert.equal(userImage, "");
    });
    it('getUserImage returns empty string if user does not have a picture',function(){
      var userImage = Meteor.myFunctions.getUserImage("nopic");
      chai.assert.equal(userImage,"");
    })
  })
});
