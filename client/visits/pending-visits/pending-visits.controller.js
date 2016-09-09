/**
 * Created by sarahcoletti on 2/18/16.
 */
import { Visit } from '/model/visits'
import {logger} from '/client/logging'

angular.module('visitry').controller('pendingVisitsCtrl', function ($scope, $stateParams, $reactive, $location, $ionicPopup,$ionicListDelegate, RequestVisit, $filter, $state) {
  $reactive(this).attach($scope);

  this.subscribe('userRequests');
  this.subscribe('userdata');

  this.showDelete = false;
  this.canSwipe = true;
  this.listSort = {
    requestedDate: 1
  };
  this.numRequests = -1;

  this.autorun( function() {
    var visits = Visit.find({requesterId: Meteor.userId(),requestedDate:{$gt:new Date()}});
    this.numRequests = visits.count();
  });

  this.helpers({
    pendingVisits: ()=> {
      var visits = Visit.find({requesterId: Meteor.userId(),requestedDate:{$gt:new Date()}}, {sort: this.getReactively('listSort')});
      return Meteor.myFunctions.groupVisitsByRequestedDate(visits);
    }
  });

  this.getVisitor = function (visit) {
    return User.findOne({_id: visit.visitorId});
  };

  this.showRequestVisitModal = function () {
    RequestVisit.showModal();
  };
  this.hideRequestVisitModal = function () {
    RequestVisit.hideModal();
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
    var confirmMessage = '';
    if (visit.visitorId) {
      confirmMessage = "Do you want to cancel your visit with " + $filter('firstNameLastInitial')(this.getVisitor(visit)) + " on " + $filter('date')(new Date(visit.visitTime),'MMMM d, h:mm') + "?"
    }
    else {
      confirmMessage = "Do you want to cancel your visit request for " + $filter('date')(new Date(visit.requestedDate)) + " ?";
    }
    var confirmPopup = $ionicPopup.confirm({
      template: confirmMessage,
      cancelText: 'No',
      okText: 'Yes'
    });
    confirmPopup.then((result)=> {
      if (result) {
        Meteor.call('visits.rescindRequest',visit._id, (err) => {
          if (err) return handleError(err);
        });
      }
      else{
        $ionicListDelegate.closeOptionButtons();
      }
    })
  };

  this.visitDetails = function (id) {
    $state.go( 'visitDetails', {visitId: id} );
  };

  function handleError(err) {
    logger.error('visits.rescindRequest error ', err);

    $ionicPopup.alert({
      title: err.reason || 'Cancel failed',
      template: 'Please try again',
      okType: 'button-positive button-clear'
    });
  }
});
