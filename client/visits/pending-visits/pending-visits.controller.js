/**
 * Created by sarahcoletti on 2/18/16.
 */
import { Visit } from '/model/visits'
import {logger} from '/client/logging'

angular.module('visitry').controller('pendingVisitsCtrl', function ($scope, $stateParams, $reactive, $location, $ionicPopup,$ionicListDelegate,$ionicHistory, RequestVisit, $filter, $state) {
  $reactive(this).attach($scope);

  this.showDelete = false;
  this.canSwipe = true;
  this.listSort = {
    requestedDate: 1
  };
  this.hasRequests = true;
  this.userId = Meteor.userId();
  this.visits = null;

  var requestsSubscription = this.subscribe( 'userRequests',
    () => { return [this.getReactively('userId')]}
  );
  this.subscribe('userdata');

  this.autorun( function() {
    if ( Meteor.userId()) {
      this.visits = Visit.find({
        requesterId: Meteor.userId(),
        requestedDate: {$gte: new Date()}
      }, {sort: this.getReactively('listSort')});
      this.hasRequests = this.visits.count() > 0;
    } else {
      requestsSubscription.stop();
    }
  });


  this.helpers({
    pendingVisits: ()=> {
      if (Meteor.userId()) {
        return Meteor.myFunctions.groupVisitsByRequestedDate(this.visits);
      } else {
        requestsSubscription.stop();
      }
    }
  });

  this.getVisitor = function (visit) {
    return User.findOne({_id: visit.visitorId},{userData:1});
  };

  this.showRequestVisitModal = function () {
    RequestVisit.showModal();
  };


  this.getTimeSinceRequested = function(requestedTime){
    return moment(requestedTime).fromNow();
  };
  this.getVisitorImage = function(visit) {
    if (visit.visitorId) {
      var visitor = this.getVisitor(visit);
      if ( visitor == undefined || visitor.userData == undefined || visitor.userData.picture == undefined ) {
        return "";
      }
      return visitor.userData.picture;
    }
    return "";
  };

  this.showCancelVisitConfirm = function (visit) {
    Meteor.myFunctions.showCancelVisitConfirm(visit,$filter,$ionicPopup,$ionicListDelegate,$ionicHistory);
  };

  this.visitDetails = function (id) {
    $state.go( 'visitDetails', {visitId: id} );
  };
});
