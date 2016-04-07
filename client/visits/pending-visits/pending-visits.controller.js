/**
 * Created by sarahcoletti on 2/18/16.
 */
angular.module('visitry').controller('pendingVisitsCtrl', function ($scope, $stateParams, $reactive, $location, $ionicPopup,$ionicListDelegate, RequestVisit, $filter) {
  $reactive(this).attach($scope);
  this.subscribe('visits');
  this.subscribe('users');

  this.showDelete = false;
  this.canSwipe = true;
  this.listSort = {
    requestedDate: 1
  };

  this.helpers({
    pendingVisits: ()=> {
      var visits = Visits.find({requesterId: Meteor.userId(),requestedDate:{$gt:new Date()}}, {sort: this.getReactively('listSort')});
      return Meteor.myFunctions.dateSortArray(visits);
    }
  });

  this.getUserFirstName = (userId)=> {
    return Meteor.users.findOne(userId).profile.firstName;
  };

  this.showRequestVisitModal = function () {
    RequestVisit.showModal();
  };
  this.hideRequestVisitModal = function () {
    RequestVisit.hideModal();
  };
  this.getTimeSinceRequested = function(date){
    var now = new Date();
    return moment(now).diff(moment(date),'days');
  }

  this.showCancelVisitConfirm = function (visit) {
    var confirmMessage = '';
    if (visit.visitorId) {
      confirmMessage = "Do you want to cancel your visit with " + this.getUserFirstName(visit.visitorId) + "?"
    }
    else {
      confirmMessage = "Do you want to cancel your visit request on " + $filter('date')(new Date(visit.requestedDate));
    }
    var confirmPopup = $ionicPopup.confirm({
      template: confirmMessage,
      cancelText: 'No',
      okText: 'Yes'
    });
    confirmPopup.then((result)=> {
      if (result) {
        Visits.remove(visit._id);
      }
      else{
        $ionicListDelegate.closeOptionButtons();
      }
    })
  }

});
