/**
 * Created by n0235626 on 7/25/16.
 */
import {Visits} from '/model/visits'

angular.module("visitry").controller('visitorFeedbackList', function ($scope, $reactive, $state) {
  $reactive(this).attach($scope);

  this.subscribe('visits');
  this.subscribe('userdata');

  this.showDelete = false;
  this.canSwipe = false;
  this.numFeedback = 0;

  this.helpers({
    pendingFeedback: ()=> {
      var visits = Visits.find({
        visitorFeedbackId: null,
        visitorId: Meteor.userId(),
        visitTime: {$lt: new Date()}
      }, {sort: {visitTime:-1}});
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
      if ( requester && requester.userData && requester.userData.picture ) {
        return requester.userData.picture;
      }
      return "";
    }
    return "";
  };

  this.getRequester = function (visit) {
    return User.findOne({_id: visit.requesterId});
  };
});