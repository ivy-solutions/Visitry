/**
 * Created by sarahcoletti on 2/24/16.
 */
import { Visit } from '/model/visits'
import {logger} from '/client/logging'

angular.module('visitry').controller('browseVisitRequestsCtrl', function ( $scope, $reactive, $state, ScheduleVisit) {
  $reactive(this).attach($scope);

  $scope.Math = window.Math;

  this.showDelete = false;
  this.canSwipe = true;
  this.listSort = {
    requestedDate: 1
  };

  this.visitRange = 3000;

  this.fromLocation = {"type": "Point", "coordinates": [-71.0589, 42.3601]};  //default = Boston

  this.hasLocation = this.visitRange < 3000;
  this.openVisitCount = -1;
  this.hasAgency = true;

  this.autorun( function() {
    var user = User.findOne({_id: Meteor.userId()}, {fields: {'userData.location': 1,'userData.visitRange': 1}});
    if ( user && user.userData && user.userData.location) {
      this.fromLocation = user.userData.location.geo;
      this.visitRange = user.userData.visitRange;
      this.hasAgency = user.hasAgency;
    } else {
      this.visitRange = 3200;
      this.fromLocation = { "type": "Point", "coordinates": [-71.0589, 42.3601] };  //default = within 3000 mi of Boston;
    }
  });

  this.helpers({
    openVisits: () => {
      var today = new Date();
      today.setHours(0,0,0,0);

      var userId = Meteor.userId();
      if (userId) {
        var user = User.findOne({_id: userId}, {fields: {'userData.location': 1, 'userData.visitRange': 1}});
        if (user && user.userData && user.userData.location) {
          this.visitRange = user.userData.visitRange;
          this.fromLocation = user.userData.location.geo;
          this.hasLocation = true;
        } else {
          this.visitRange = 3000;
          this.fromLocation = {"type": "Point", "coordinates": [-71.0589, 42.3601]};  //default = Boston;
          this.hasLocation = false;
        }
        logger.info("openVisits within " + this.visitRange + " miles of " + JSON.stringify(this.fromLocation));
        var visits = Visit.find({
          visitorId: null,
          "location.geo": {
            $near: {
              $geometry: this.fromLocation,
              $maxDistance: this.visitRange * 1609
            }
          },
          requestedDate: {$gt: today},
          'requesterId': {$ne: userId},
          inactive: {$exists: false}
        }, {
          sort: this.getReactively('listSort'),
          fields: {"requesterId": 1, "requestedDate": 1, "notes": 1, "location": 1}
        });
        this.openVisitCount = visits.count();
        return Meteor.myFunctions.groupVisitsByRequestedDate(visits);
      }
    }
  });

   ////////

  this.getRequester = function (visit) {
    if ( visit == null ) {
      return null;
    }
    return User.findOne({_id: visit.requesterId});
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
    ScheduleVisit.showModal( visit );
   };
});