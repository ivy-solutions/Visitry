/**
 * Created by sarahcoletti on 2/24/16.
 */
import { Visit } from '/model/visits'
import {logger} from '/client/logging'
import { Enrollment } from '/model/enrollment'
import { Agency } from '/model/agencies'

angular.module('visitry').controller('browseVisitRequestsCtrl', function ( $scope, $reactive, $state, ScheduleVisit, available) {
  $reactive(this).attach($scope);

  $scope.Math = window.Math;

  this.showDelete = false;
  this.canSwipe = true;
  this.listSort = {
    requestedDate: 1
  };
  this.isMembershipDataLoaded = false;

  this.subscribe('userdata'); //userdata for self and all requesters and potential requesters
  let enrollmentSubscription = this.subscribe('memberships', ()=> {
    return [Meteor.userId()]
  }, ()=> {
    this.isMembershipDataLoaded = true;
  });

  this.visitRange = 3000;

  this.fromLocation;

  this.hasLocation = true;
  this.visits;
  this.agencyIds;
  this.hasAgency;

  this.autorun( function() {
    var user = User.findOne({_id: Meteor.userId()}, {fields: {'userData.location': 1,'userData.visitRange': 1, 'userData.agencyIds': 1, roles: 1}});
    if (user) {
      this.agencyIds = user.hasAgency ? user.userData.agencyIds : ['noagency'];
      this.hasAgency = user.hasAgency;
      let agencyId = this.agencyIds.find( function( id ){
        return id != 'noagency'
      });

      if (user.userData && user.userData.visitRange) {
        this.visitRange = user.userData.visitRange;
      }

      if ( user.userData && user.userData.location) {
        this.fromLocation = user.userData.location;
      } else if (agencyId) {
        // if user does not have a location, use the location of the first agency they belong to
        let agency = Agency.findOne(agencyId, {location: 1});
        if (agency && agency.location) {
          this.fromLocation = agency.location;
        }
      }
      if (!this.fromLocation) { //if neither user nor agency have location use default - Wichita, Kansas
        this.fromLocation = { "formattedAddress": "Default location", "geo": {"type": "Point", "coordinates": [-97.415021, 37.716408]}};
        this.visitRange = 4000;
        this.hasLocation = false;
      }

      this.hasLocation = this.fromLocation && this.visitRange < 3000;

      const today = new Date();
      today.setHours(0,0,0,0);
      this.visits = Visit.find({
        agencyId: {$in: this.agencyIds},
        visitorId: null,
        "location.geo": {
          $near: {
            $geometry: this.fromLocation.geo,
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
      this.isMembershipDataLoaded = enrollmentSubscription.ready();
    } else {
      //no user, logging off
      this.hasAgency = true;  //do not want to flash the 'Join Group' button
      this.isMembershipDataLoaded =false;
    }
  });

  this.helpers({
    openVisits: () => {
      // make sure list gets updated if user is added to an agency
      var userAgencies = this.getReactively('agencyIds');
      var hasAgency = this.getReactively('hasAgency');

      if (Meteor.userId()) {
        if (this.visits) {
          //logger.info("openVisits in agencies: " + userAgencies + " within " + this.visitRange + " miles of " + JSON.stringify(this.fromLocation));
          return Meteor.myFunctions.groupVisitsByRequestedDate(this.getReactively('visits'));
        }
      } else {
        available.stop();
      }
    },
    openVisitCount: () =>{
      // Use visits.count() rather than Counts value to accomodate user's changes in profile
      // location range or location
      var hasAgency = this.getReactively('hasAgency');
      let visits = this.getReactively('visits');
      return visits? visits.count() : 0;
    },
    membershipPending: () => {
    //true if not yet a member of any agency but have applied to at least one agency.
      let hasAgency = this.getReactively('hasAgency');
      let dataLoaded = this.getReactively('isMembershipDataLoaded');
      let application = Enrollment.findOne({userId: Meteor.userId(), approvalDate: null});
      return application;
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
    var fromLatRads = degreesToRadians(this.fromLocation.geo.coordinates[1]);
    var fromLongRads = degreesToRadians(this.fromLocation.geo.coordinates[0]);
    var toLatRads = degreesToRadians(toLocation.geo.coordinates[1]);
    var toLongRads = degreesToRadians(toLocation.geo.coordinates[0]);
    var distance = Math.acos(Math.sin(fromLatRads) * Math.sin(toLatRads) + Math.cos(fromLatRads) * Math.cos(toLatRads) * Math.cos(fromLongRads - toLongRads)) * EarthRadiusInMiles;
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

  this.groups = function (id) {
    $state.go( 'agencyList');
  };
});