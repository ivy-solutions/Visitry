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
  this.vicinity = 3000; //default = 3000 miles
  this.fromLocation = { "type": "Point", "coordinates": [-71.0589, 42.3601] };  //default = Boston
  this.hasLocation = false;
  this.openVisitCount = -1;

  this.subscribe('availableVisits',function() {[Meteor.userId()]});
  this.subscribe('userdata', function() {}, {
    onReady: function () {
      var user = Meteor.users.findOne({_id: Meteor.userId()},  {fields: {'userData.location': 1,'userData.vicinity': 1}});
      console.log( "userdata ready");
      if ( user && user.userData && user.userData.location) {
        this.vicinity = user.userData.vicinity;
        this.fromLocation = user.userData.location.geo;
        this.hasLocation = true;
        console.log( "user has location: " + JSON.stringify(this.fromLocation) + " vicinity: " + this.vicinity );
      }else {
        this.vicinity = 3000;
        this.fromLocation = { "type": "Point", "coordinates": [-71.0589, 42.3601] };  //default = Boston;
        this.hasLocation= false;
      }
    }
  });

  this.autorun( function() {
    console.log( "autorun " );
    var user = Meteor.users.findOne({_id: Meteor.userId()}, {fields: {'userData.location': 1,'userData.vicinity': 1}});
    if (user && user.userData && user.userData.location) {
      this.vicinity = user.userData.vicinity;
      this.fromLocation = user.userData.location.geo;
      this.hasLocation = true;
    }else {
      this.vicinity = 3000;
      this.fromLocation = { "type": "Point", "coordinates": [-71.0589, 42.3601] };  //default = Boston;
      this.hasLocation = false;
    }
  });

  this.helpers({
    openVisits: () => {
      let userId = Meteor.userId();
      let selector;
      var today = new Date();
      today.setHours(0,0,0,0);
      console.log("this.fromLocation " + JSON.stringify(this.fromLocation) + " vicinity: " + this.vicinity );
      selector = {
        'visitorId': {$exists: false},
        "location.geo": {
          $near: {
            $geometry: this.getReactively('fromLocation'),
            $maxDistance: this.getReactively('vicinity') * 1609
          }
        },
        requestedDate: {$gt: today},
        'requesterId': {$ne: userId},
        inactive: {$exists: false}
      };
      this.visits = Visits.find(selector, {sort: this.getReactively('listSort'),
        fields: {"requesterId": 1,"requestedDate": 1, "notes": 1, "location": 1}} );
      this.openVisitCount = this.visits.count();
      return Meteor.myFunctions.groupVisitsByRequestedDate(this.visits);
    },
    currentUser: () => {
      return Meteor.users.find({_id: Meteor.userId()}, {fields: {'userData': 1}});
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
    if (!this.hasLocation) {
      console.log( "no current user location." );
      return "";
    }
    var EarthRadiusInMiles = 3956.0;
    var EarthRadiusInKilometers = 6367.0;
    var fromLatRads = degreesToRadians(this.fromLocation.coordinates[1]);
    var fromLongRads = degreesToRadians(this.fromLocation.coordinates[0]);
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
      return '/packages/visitry-browser/client/visits/schedule-visit/schedule-visit-modal.html'
    }
  }


});