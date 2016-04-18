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
  this.currentUser;

  this.helpers({
     openVisits: () => {
      let selector = {
          'visitorId': {$exists: false},
          'requestedDate': {$gt: new Date()}
      };
      var visits = Visits.find(selector, {sort: this.getReactively('listSort')} );
      return Meteor.myFunctions.dateSortArray(visits);
    }
  });

  this.subscribe('visits');
  this.subscribe('users', function() {
    this.currentUser = Meteor.user();
  });

  ////////

  this.getRequester = function (visit) {
    if ( typeof(visit) == 'undefined' ) {
      return null;
    }
    return Meteor.users.findOne({_id: visit.requesterId});
  };

  this.getRequesterImage = function(visit) {
    if ( typeof(visit) == 'undefined' ) {
      return null;
    }
    var requester = Meteor.users.findOne({_id: visit.requesterId});
    if ( typeof(requester.userData.picture) === 'undefined' )
      return "";
    else
      return requester.userData.picture;
  };

  this.getDistanceToVisitLocation = function ( visit ) {
    //if user does not have a location, then make the result 0
    var toLocation = visit.location;
    var fromLocation = this.currentUser && this.currentUser.location ? this.currentUser.location : toLocation;
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