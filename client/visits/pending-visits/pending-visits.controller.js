/**
 * Created by sarahcoletti on 2/18/16.
 */
angular.module('visitry').controller('pendingVisitsCtrl', function ($scope, $stateParams, $reactive, $ionicPopup, RequestVisit, $filter) {

  $reactive(this).attach($scope);
  this.showDelete = false;
  this.canSwipe = true;
  this.listSort = {
    date: 1
  };

  this.subscribe('visits');
  this.subscribe('users');

  this.helpers({
    pendingVisits: ()=> {
      var visits = Visits.find({requesterId:Meteor.userId()}, {sort: this.getReactively('listSort')});
      return Meteor.myFunctions.dateSortArray(visits);
    }
  });

  this.getUserFirstName =(userId)=>{
    return Meteor.users.findOne(userId).profile.firstName;
  };

  this.showRequestVisitModal = function () {
    RequestVisit.showModal();
  };
  this.hideRequestVisitModal = function () {
    RequestVisit.hideModal();
  };

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
    })
  }

});
