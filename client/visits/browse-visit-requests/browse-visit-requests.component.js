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

  this.visits = null;
  this.vicinity = 56;
  this.distanceFromLocation = null;
  this.openVisitCount;

  this.autorun(()=> {
    console.log( "autoRun");
    var user = Meteor.users.findOne({_id: Meteor.userId()}, {'userData.vicinity': 1, 'userData.location': 1});
    if ( user && user.userData && user.userData.location) {
      console.log( "autoRun update")
      this.vicinity = user.userData.vicinity;
      this.distanceFromLocation = user.userData.location.geo;
    }
  });

  this.helpers({
     openVisits: () => {
       let userId = Meteor.userId();
       let selector;
       var today = new Date();
       today.setHours(0,0,0,0);
       if ( this.distanceFromLocation ) {
         console.log("this.distanceFromLocation " + JSON.stringify(this.distanceFromLocation) + " vicinity: " + this.vicinity );
         selector = {
           'visitorId': {$exists: false},
           "location.geo": {
             $near: {
               $geometry: this.getReactively('distanceFromLocation'),
               $maxDistance: this.getReactively('vicinity') * 1609
             }
           },
           requestedDate: {$gt: today},
           'requesterId': {$ne: userId},
           inactive: {$exists: false}
         }
       } else {
         console.log("select with no location" );
         selector = {
           'visitorId': {$exists: false},
           'requesterId': {$ne: userId},
           requestedDate: {$gt: today},
           inactive: {$exists: false}
         }
       }
       this.visits = Visits.find(selector, {sort: this.getReactively('listSort'),
        fields: {"requesterId": 1,"requestedDate": 1, "notes": 1, "location": 1}} );
       this.openVisitCount = this.visits.count();
       return Meteor.myFunctions.groupVisitsByRequestedDate(this.visits);
     },
    currentUser: () => {
      return Meteor.users.find({_id: Meteor.userId()})
    }
  });

  this.subscribe('userdata', function() {}, {
    onReady: function () {
      var user = Meteor.users.findOne({_id: Meteor.userId()}, {'userData.vicinity': 1, 'userData.location': 1});
      this.vicinity = user.userData.vicinity;
      console.log( "userdata ready");
      if ( user.userData.location) {
        console.log( "has location");
        this.distanceFromLocation = user.userData.location.geo;
      }
     }
  });

  this.subscribe('visits',
    function() {
      [ {fields: {"requesterId": 1,"requestedDate": 1, "notes": 1, "location": 1}}]
    }, {
    onReady: function () {
      console.log("visits ready.");
    }
  });

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

  this.getDistanceToVisitLocation = function ( visit ) {
    //if user does not have a location, then make the result 0
    var toLocation = visit.location;
    if ( toLocation == null )
      return "";
    if (!this.distanceFromLocation) {
      console.log( "no current user location." );
      return "";
    }
    var EarthRadiusInMiles = 3956.0;
    var EarthRadiusInKilometers = 6367.0;
    var fromLatRads = degreesToRadians(this.distanceFromLocation.coordinates[1]);
    var fromLongRads = degreesToRadians(this.distanceFromLocation.coordinates[0]);
    var toLatRads = degreesToRadians(toLocation.geo.coordinates[1]);
    var toLongRads = degreesToRadians(toLocation.geo.coordinates[0]);
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