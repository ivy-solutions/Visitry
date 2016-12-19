/**
 * Created by sarahcoletti on 7/7/16.
 */

import {Agencies} from '/model/agencies'

angular.module('visitry').controller('listAgenciesCtrl', function ($scope, $stateParams, $reactive ) {
  $reactive(this).attach($scope);

  this.perPage = 3;
  this.page = 1;
  this.sort = {
    name: 1
  };
  this.orderProperty = '1';
  this.searchText = '';

  this.helpers({
    agencies: () => {
      return Agencies.find({}, {sort: this.getReactively('sort')});
    }
  });

  this.subscribe('userBasics');
  this.subscribe('allAgencies', () => {
    return [
      {
        limit: parseInt(this.perPage),
        skip: parseInt((this.getReactively('page') - 1) * this.Page),
        sort: this.getReactively('sort')
      },
      this.getReactively('searchText')
    ]
  });

  this.registered = (agencyId) => {
    if (Meteor.userId()) {
      var user = User.findOne({_id: Meteor.userId()}, {fields: {'userData.agencyIds': 1}});
      var myAgencies = user.userData.agencyIds;
      return myAgencies && myAgencies.includes(agencyId);
    }
    return false;
  }
});