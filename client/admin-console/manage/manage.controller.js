/**
 * Created by n0235626 on 8/9/16.
 */
import { Visit } from '/model/visits'


angular.module('visitry.browser').controller('adminManageCtrl', function ($scope, $state, $reactive) {
  $reactive(this).attach($scope);
  var TopUsers = new Mongo.Collection("topVisitors");

  this.topVisitorsDayRange = 365;

  this.subscribe('visits');
  this.subscribe('userdata');
  this.subscribe('topVisitors', ()=> {
    return [this.getReactively('topVisitorsDayRange')]
  });

  this.helpers({
    upcomingVisits: ()=> {
      let selector = {
        'visitTime': {$exists: true, $gt: new Date()}
      };
      var visits = Visit.find(selector, {
        sort: {visitTime: 1}, limit: 10
      });
      return Meteor.myFunctions.groupVisitsByRequestedDate(visits);
    },
    outstandingRequests: ()=> {
      let selector = {
        'visitTime': {$exists: false},
        'agencyId': {$eq:Session.get('agencyId')}
      };
      var visits = Visit.find(selector, {sort: {requestedDate: 1}, limit: 10});
      return Meteor.myFunctions.groupVisitsByRequestedDate(visits);
    },
    topVisitors: ()=> {
      return TopUsers.find({'agencyId': {$eq:Session.get('agencyId')}},{sort: {visitCount: -1}, limit: 10});
    }
  });

  this.getUser = function (userId) {
    if (userId == 'undefined') {
      console.log("No User Specified.");
      return null;
    }
    return User.findOne({_id: userId});
  };

  this.getUserImage = function (userId) {
    var user = this.getUser(userId);
    if (user && user.userData&& user.userData.picture)
      return user.userData.picture;
    else
      return "";
  };
});