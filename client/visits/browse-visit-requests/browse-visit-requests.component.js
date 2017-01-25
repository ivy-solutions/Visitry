/**
 * Created by sarahcoletti on 2/24/16.
 */
import { Visit } from '/model/visits'
import {logger} from '/client/logging'

angular.module('visitry').controller('browseVisitRequestsCtrl', function ( $scope, $reactive, $state, ScheduleVisit, available) {
  $reactive(this).attach($scope);

  $scope.Math = window.Math;

  this.showDelete = false;
  this.canSwipe = true;
  this.listSort = {
    requestedDate: 1
  };

  this.subscribe('userdata'); //userdata for self and all requesters and potention requesters

  this.visitRange = 3000;

  this.fromLocation = {"type": "Point", "coordinates": [-71.0589, 42.3601]};  //default = Boston

  this.hasLocation = this.visitRange < 3000;
  this.visits;
  this.agencyIds;
  this.hasAgency = true;

  this.autorun( function() {
    var user = User.findOne({_id: Meteor.userId()}, {fields: {'userData.location': 1,'userData.visitRange': 1, 'userData.agencyIds': 1}});
    if (user) {
      if ( user.userData && user.userData.location) {
        this.fromLocation = user.userData.location.geo;
        this.visitRange = user.userData.visitRange;
        this.hasLocation = true;
      } else {
        this.visitRange = 4000;
        this.fromLocation = { "type": "Point", "coordinates": [-97.415021, 37.716408]};  //default - within 4000 miles of Wichita, Kansas
        this.hasLocation = false;
      }

      this.agencyIds = user.hasAgency ? user.userData.agencyIds : ['nosuchagency'];
      this.hasAgency = user.hasAgency;
      const today = new Date();
      today.setHours(0,0,0,0);
      this.visits = Visit.find({
        agencyId: {$in: this.agencyIds},
        visitorId: null,
        "location.geo": {
          $near: {
            $geometry: this.fromLocation,
            $maxDistance: this.visitRange * 1609
          }
        },
        requestedDate: {$gt: today},
        'requesterId': {$ne: user._id},
        inactive: {$exists: false}
      }, {
        sort: this.getReactively('listSort'),
        fields: {"requesterId": 1, "requestedDate": 1, "notes": 1, "location": 1}
      });
    }
  });

  this.helpers({
    openVisits: () => {
      // make sure list gets updated if user is added to an agency
      var userAgencies = this.getReactively('agencyIds');
      var hasAgency = this.getReactively('hasAgency');

      if (Meteor.userId()) {
        if (this.visits) {
          logger.info("openVisits in agencies: " + userAgencies + " within " + this.visitRange + " miles of " + JSON.stringify(this.fromLocation));
          return Meteor.myFunctions.groupVisitsByRequestedDate(this.getReactively('visits'));
        }
      } else {
        available.stop();
      }
    },
    openVisitCount(){
      // Use visits.count() rather than Counts value to accomodate user's changes in profile
      // location range or location
      let visits = this.getReactively('visits');
      return visits.count();
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