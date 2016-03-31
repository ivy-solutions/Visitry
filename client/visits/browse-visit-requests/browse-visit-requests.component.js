/**
 * Created by sarahcoletti on 2/24/16.
 */
angular.module('visitry').controller('browseVisitRequestsCtrl', function ($scope, $reactive, $location, $state, $ionicModal) {
  $reactive(this).attach($scope);

  $scope.Math = window.Math;

  this.showDelete = false;
  this.canSwipe = true;
  this.listSort = {
    requestedDate: 1
  };

  this.helpers({
     openVisits: () => {
      let selector = {
          'visitorId': {$exists: false},
          'requestedDate': {$gt: new Date()}
      };
      return Visits.find(selector, {sort: this.getReactively('listSort')} );
    },
     users: () => { //I don't understand why I need this for getRequester to work
       return Meteor.users.find({});
     }
  });

  this.subscribe('visits');
  this.subscribe('users');

  ////////

  this.getRequester = function (visit) {
    return Meteor.myFunctions.getRequester(visit)
  };

  this.getDistanceToVisitLocation = function ( visit ) {
    //if user does not have alocation, then make the result 0
    var toLocation = visit.location;
    var fromLocation = Meteor.user().location ? Meteor.user.location : toLocation;
    var EarthRadiusInMiles = 3956.0
    var EarthRadiusInKilometers = 6367.0
    var fromLatRads = degreesToRadians(42.331186);
    var fromLongRads = degreesToRadians(fromLocation.longitude);
    var toLatRads = degreesToRadians(toLocation.latitude);
    var toLongRads = degreesToRadians(toLocation.longitude);
    var distance = Math.acos(Math.sin(fromLatRads) * Math.sin(toLatRads) + Math.cos(fromLatRads) * Math.cos(toLatRads) * Math.cos(fromLongRads - toLongRads)) * EarthRadiusInMiles
    return (distance).toString();
  };

  function degreesToRadians(degrees) {
    return (degrees * Math.PI) /180;
  };

  this.viewUpcomingVisits = function () {
    $location.path("/visitor/upcoming");
  };

  this.visitDetails = function (id) {
    $state.go( 'visitDetails', {visitId: id} );
  };

  this.scheduleVisit = function(visit) {
    console.log("visit id:" + visit._id);
    $scope.visit = visit;
    $scope.modalCtrl.show();
  };

  $ionicModal.fromTemplateUrl(getModalHtml(), function(modal) {
    $scope.modalCtrl = modal;
  }, {
    scope: $scope,  // give the modal access to parent scope
    animation: 'slide-in-left'
  });


  function getModalHtml() {
    if (Meteor.isCordova) {
      return '/packages/visitry-mobile/client/visits/schedule-visit/schedule-visit-modal.html'
    }
    else {
      return '/packages/vistry-browser/client/visits/schedule-visit/schedule-visit-modal.html'
    }
  }


});