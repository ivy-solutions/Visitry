/**
 * Created by sarahcoletti on 2/24/16.
 */
angular.module('visitry').controller('browseVisitRequestsCtrl', function ( $scope, $reactive, $state, $ionicModal) {
  $reactive(this).attach($scope);

  $scope.Math = window.Math;

  this.showDelete = false;
  this.canSwipe = true;
  this.listSort = {
    requestedDate: 1
  };

  this.visits;

  this.helpers({
     openVisits: () => {
       let userId = Meteor.userId();
       let selector = {
         'visitorId': {$exists: false},
         'requestedDate': {$gt: new Date()},
         'requesterId': {$ne: userId}
       };
       this.visits = Visits.find(selector, {sort: this.getReactively('listSort'),
        fields: {"requesterId": 1,"requestedDate": 1, "notes": 1, "location": 1}} );
       return Meteor.myFunctions.groupVisitsByRequestedDate(this.visits);
     },
    currentUser: () => {
      return Meteor.users.find({_id: Meteor.userId()})
    }
  });

  this.subscribe('visits');
  this.subscribe('userdata');

  ////////

  this.getRequester = function (visit) {
    if ( visit == 'undefined' ) {
      console.log("No visit.");
      return null;
    }
    return Meteor.users.findOne({_id: visit.requesterId});
  };

  this.getRequesterImage = function(visit) {
    var requester = this.getRequester(visit);
    if ( requester == undefined || requester.userData == undefined || requester.userData.picture == undefined )
      return "";
    else
      return requester.userData.picture;
  };

  var extractCurrentUserLocation = function() {
    var user = Meteor.user();
    var currentUserLocation = user && user.userData && user.userData.location;
    console.log('location ' + JSON.stringify(currentUserLocation));
    return currentUserLocation;
  };

  this.getDistanceToVisitLocation = function ( visit ) {
    //if user does not have a location, then make the result 0
    var toLocation = visit.location;
    if ( toLocation == null )
      return "";
    var userLocation = extractCurrentUserLocation();
    if ( !userLocation ) {
      console.log( "no current user location." );
      return "";
    }
    var EarthRadiusInMiles = 3956.0;
    var EarthRadiusInKilometers = 6367.0;
    var fromLatRads = degreesToRadians(userLocation.latitude);
    var fromLongRads = degreesToRadians(userLocation.longitude);
    var toLatRads = degreesToRadians(toLocation.latitude);
    var toLongRads = degreesToRadians(toLocation.longitude);
    var distance = Math.acos(Math.sin(fromLatRads) * Math.sin(toLatRads) + Math.cos(fromLatRads) * Math.cos(toLatRads) * Math.cos(fromLongRads - toLongRads)) * EarthRadiusInMiles
    var rounded = distance.toFixed(1);
    return (rounded).toString() + " miles";
  };

  function degreesToRadians(degrees) {
    return (degrees * Math.PI) /180;
  }

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
      return '/packages/visitrymobile/client/visits/schedule-visit/schedule-visit-modal.html'
    }
    else {
      return '/packages/vistry-browser/client/visits/schedule-visit/schedule-visit-modal.html'
    }
  }


});