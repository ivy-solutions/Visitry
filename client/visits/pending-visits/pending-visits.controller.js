/**
 * Created by sarahcoletti on 2/18/16.
 */
import { Visit } from '/model/visits'
import {logger} from '/client/logging'

angular.module('visitry').controller('pendingVisitsCtrl',
  function ($scope, $stateParams, $reactive, $location, $ionicPopup,$ionicListDelegate,$ionicHistory, RequestVisit, $filter, $state, feedback) {
  $reactive(this).attach($scope);

  this.showDelete = false;
  this.canSwipe = true;
  this.listSort = {
    requestedDate: 1
  };
  this.hasRequests = true;
  this.userId = Meteor.userId();
  this.visits = null;
  this.hasAgency = true;

  this.subscribe('userdata');

  this.autorun( function() {
    if ( Meteor.userId()) {
      this.visits = Visit.find({
        requesterId: Meteor.userId(),
        requestedDate: {$gte: new Date()}
      }, {sort: this.getReactively('listSort')});
      this.hasRequests = this.visits.count() > 0;
      let currentUser = User.findOne(Meteor.userId(),{fields: {'userData.agencyIds': 1, 'userData.prospectiveAgencyIds': 1}});
      this.hasAgency = currentUser.hasAgency;
    } else {
      feedback.stop()
    }
  });


  this.helpers({
    pendingVisits: ()=> {
      var hasAgency = this.getReactively('hasAgency');
      if (Meteor.userId()) {
        return Meteor.myFunctions.groupVisitsByRequestedDate(this.visits);
      } else {
        feedback.stop()
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

  this.isToday = function(date) {
    let today = moment();
    let dateToCompare = moment(date);
    return today.isSame(dateToCompare, 'd');
  };

  this.showCancelVisitConfirm = function (visit) {
    Meteor.myFunctions.showCancelVisitConfirm(visit,$filter,$ionicPopup,$ionicListDelegate,$ionicHistory);
  };

  this.visitDetails = function (id) {
    $state.go( 'visitDetails', {visitId: id} );
  };
});
