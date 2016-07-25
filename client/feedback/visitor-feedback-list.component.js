/**
 * Created by n0235626 on 7/25/16.
 */
import { User } from '/model/users'
import {Visits} from '/model/visits'

angular.module("visitry").controller('visitorFeedbackList', function ($scope, $reactive, $state) {
  $reactive(this).attach($scope);

  this.subscribe('visits');
  this.subscribe('userdata');

  this.showDelete = false;
  this.canSwipe = false;
  this.listSort = {
    visitTime:-1
  };
  this.numFeedback = 0;

  this.helpers({
    pendingFeedback: ()=> {
      var visits = Visits.find({
        visitorFeedbackId: null,
        visitorId: Meteor.userId(),
        requestedDate: {$lt: new Date()}
      }, {sort: this.getReactively('listSort')});
      this.numFeedback = visits.count();
      return Meteor.myFunctions.groupVisitsByRequestedDate(visits);
    }
  });

  this.giveFeedback = function(visitId){
    $state.go('visitorFeedback',{visitId:visitId});
  };

  this.getRequesterImage = function(visit) {
    if (visit.requesterId) {
      var requester = this.getRequester(visit);
      console.log( "getRequesterImage: " + visit.requesterId + " " + JSON.stringify(requester));
      if ( requester == undefined || requester.userData == undefined || requester.userData.picture == undefined ) {
        return "";
      }
      return requester.userData.picture;
    }
    return "";
  };

  this.getRequester = function (visit) {
    return User.findOne({_id: visit.requesterId});
  };
});