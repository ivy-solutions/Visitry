/**
 * Created by sarahcoletti on 7/7/16.
 */

import {Agency} from '/model/agencies'

angular.module('visitry').controller('listAgenciesCtrl', function ($scope, $stateParams, $reactive, $state, ChangeMembership ) {
  $reactive(this).attach($scope);

  this.canSwipe = true;
  this.perPage = 3;
  this.page = 1;
  this.sort = {
    name: 1
  };
  this.orderProperty = '1';
  this.searchText = '';

  this.helpers({
    agencies: () => {
      return Agency.find({}, {sort: this.getReactively('sort')});
    }
  });

  this.subscribe('userProfile');
  this.subscribe('allAgencies', () => {
    return [
      {
        limit: parseInt(this.perPage),
        skip: parseInt((this.getReactively('page') - 1) * this.page),
        sort: this.getReactively('sort')
      },
      this.getReactively('searchText')
    ]
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
  this.revokeRequest = (id) => {
    let agency = Agency.findOne(id);
    ChangeMembership.showModal(agency, true);
  };
  this.requestMembership = (id) => {
    let agency = Agency.findOne(id);
    ChangeMembership.showModal(agency, false);
  };

  this.home = function () {
    $state.go( 'login');
  };

});