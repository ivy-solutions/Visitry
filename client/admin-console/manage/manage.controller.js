/**
 * Created by n0235626 on 8/9/16.
 */
import { Visit } from '/model/visits'
import {TopVisitors} from '/model/users'


angular.module('visitry.browser').controller('adminManageCtrl', function ($scope, $state, $reactive,$cookies) {
  $reactive(this).attach($scope);

  this.topVisitorsDayRange = 365;
  this.agencyId = $cookies.get('agencyId');
  this.subscribe('visits');
  this.subscribe('userdata');
  this.subscribe('topVisitors', ()=> {
    return [this.getReactively('agencyId'), this.getReactively('topVisitorsDayRange')]
  }, {
    onReady: function () {
      console.log("onReady And the Items actually Arrive", arguments);
    }
  });

  this.helpers({
    upcomingVisits: ()=> {
      let selector = {
        'visitTime': {$exists: true, $gt: new Date()},
        'agencyId': {$eq: this.agencyId}
      };
      var visits = Visit.find(selector, {
        sort: {visitTime: 1}, limit: 10
      });
      return Meteor.myFunctions.groupVisitsByRequestedDate(visits);
    },
    outstandingRequests: ()=> {
      let selector = {
        'visitTime': {$exists: false},
        'agencyId': {$eq: this.agencyId}
      };
      var visits = Visit.find(selector, {sort: {requestedDate: 1}, limit: 10});
      return Meteor.myFunctions.groupVisitsByRequestedDate(visits);
    },
    topVisitors: ()=> {
      return TopVisitors.find({}, {sort: {visitCount: -1}, limit: 10});
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
    if (user && user.userData && user.userData.picture)
      return user.userData.picture;
    else
      return "";
  };
});