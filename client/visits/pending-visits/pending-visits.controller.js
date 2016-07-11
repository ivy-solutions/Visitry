/**
 * Created by sarahcoletti on 2/18/16.
 */
angular.module('visitry').controller('pendingVisitsCtrl', function ($scope, $stateParams, $reactive, $location, $ionicPopup,$ionicListDelegate, RequestVisit, $filter) {
  $reactive(this).attach($scope);

  this.showDelete = false;
  this.canSwipe = true;
  this.listSort = {
    requestedDate: 1
  };
  this.numRequests = 0;

  this.helpers({
    pendingVisits: ()=> {
      var visits = Visits.find({requesterId: Meteor.userId(),requestedDate:{$gt:new Date()}}, {sort: this.getReactively('listSort')});
      this.numRequests = visits.count();
      return Meteor.myFunctions.groupVisitsByRequestedDate(visits);
    }
  });

  this.getVisitor = function (visit) {
    return Meteor.users.findOne({_id: visit.visitorId});
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
      console.log( "getVisitorImage: " + visit.visitorId + " " + JSON.stringify(visitor));
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

  function handleError(err) {
    $log.error('visits.rescindRequest error ', err);

    $ionicPopup.alert({
      title: err.reason || 'Cancel failed',
      template: 'Please try again',
      okType: 'button-positive button-clear'
    });
  }
});
