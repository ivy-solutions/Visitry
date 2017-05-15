/**
 * Created by sarahcoletti on 7/7/16.
 */

import {Agency} from '/model/agencies'
import { Enrollment } from '/model/enrollment'
import {logger} from '/client/logging'

angular.module('visitry').controller('listAgenciesCtrl', function ($scope, $stateParams, $reactive, $state, $ionicHistory ) {
  $reactive(this).attach($scope);

  this.canSwipe = true;
  this.coordinates = [];

  this.helpers({
    agencies: () => {
      let user = User.findOne({_id: Meteor.userId()}, {fields: {'userData.location': 1}});
      if ( user && user.userData && user.userData.location) {
        this.coordinates = user.userData.location.geo.coordinates;
      } else {
        var latLng = Geolocation.latLng();
        if (latLng ) {
          this.coordinates = [latLng.lng, latLng.lat]
        } else {
          logger.error("Error getting current location: " + Geolocation.error());
          this.coordinates = [-71.0589, 42.3601]; //default location: Boston
        }
      }
      return Agency.find({
        'location.geo': {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: this.coordinates
            }
          }
        }
      });
    }
  });

  this.subscribe('userProfile');
  this.subscribe('allAgencies', () => { return [ {reactive:false}] });
  this.subscribe('memberships', ()=> {
    return [Meteor.userId()]
  });

  this.isMember = (agencyId) => {
    return Meteor.myFunctions.membershipStatus(agencyId) === 'member';
  };
  this.isPendingMember = (agencyId) => {
    return Meteor.myFunctions.membershipStatus(agencyId) === 'pendingMember';
  };
  this.isNotMember = (agencyId) => {
    return Meteor.myFunctions.membershipStatus(agencyId) === 'notMember';
  };
  this.membershipStatus = (agencyId) => {
    return Meteor.myFunctions.membershipStatus(agencyId);
  };

  this.agencyDetail = function (id) {
    $state.go( 'agencyDetails', {groupId: id} );
  };
  this.canRequestMembership = (id) => {
    if (!this.isMember(id)) {
      // visitors can be members of many groups, requesters, only one
      if (Meteor.myFunctions.isVisitor()) {
        return true;
      } else {
        return Enrollment.find({userId: Meteor.userId()}).count() === 0;
      }
    }
    return false;
  };
  this.canRevokeMembershipRequest = (id) => {
    return this.isPendingMember(id);
  };
  this.revokeRequest = (id) => {
    let agency = Agency.findOne(id);
    Meteor.call('revokeJoinRequest', agency._id, "");
  };
  this.requestMembership = (id) => {
    let agency = Agency.findOne(id);
    Meteor.call('sendJoinRequest', agency._id, "");
  };


  this.profile = function () {
    if (!$ionicHistory.backView() ) {
      $state.go('profile');  //if we are registering direct to finish profile
    }
  };
  this.registering = function() {
    return !$ionicHistory.backView()
  }

});