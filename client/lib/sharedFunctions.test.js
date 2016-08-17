/**
 * Created by sarahcoletti on 6/16/16.
 */
import {chai} from 'meteor/practicalmeteor:chai';
import '/client/lib/sharedFunctions.js';

describe ( 'SharedFunctions', function() {

  var tomorrow = new Date();
  tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));
  var yesterday = new Date();
  yesterday.setTime(yesterday.getTime() - ( 24 * 60 * 60 * 1000));
  const futureVisitRequest = {requestedDate: tomorrow };
  const pastVisitRequest = {requestedDate: yesterday};
  const sameDayFutureVisitRequest = {requestedDate:new Date(futureVisitRequest.requestedDate)};
  var today = new Date()
  const nowVisitRequest = {requestedDate: today};
  var todayAt9 = new Date(today);
  todayAt9.setHours(9,0,0,0)
  const todayAt9VisitRequest = {requestedDate: todayAt9};

  describe ('groupVisitsByRequestedDate', function() {
    it('groups by requestedDate into 3 groups', function () {
      var dateGroupedArray = Meteor.myFunctions.groupVisitsByRequestedDate([ pastVisitRequest,todayAt9VisitRequest,nowVisitRequest,futureVisitRequest,sameDayFutureVisitRequest]);
      chai.assert.equal(3,dateGroupedArray.length,"Grouped by yesterday, today, tomorrow");
      chai.assert.equal(1, dateGroupedArray[0].visits.length, "yesterday");
      chai.assert.equal(pastVisitRequest.requestedDate, dateGroupedArray[0].visits[0].requestedDate, "pastVisitRequest");
      chai.assert.equal(2, dateGroupedArray[1].visits.length, "Today");
      chai.assert.equal(2, dateGroupedArray[2].visits.length, "Tomorrow");
    })
  });
});
