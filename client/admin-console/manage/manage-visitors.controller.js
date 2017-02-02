/**
 * Created by josiah on 9/7/16.
 */
import { Counts } from 'meteor/tmeasday:publish-counts';
import {VisitorUsers} from '/model/users'

angular.module('visitry.browser').controller('adminManageVisitorsCtrl', function ($scope, $state, $reactive, $cookies, UserDetailsDialog) {
  $reactive(this).attach($scope);

  this.agencyId = $cookies.get('agencyId');
  this.recordPerPage = 10;
  this.page = 1;
  this.order = 1;
  this.sort = {
    'userData.lastName': this.order
  };

  this.subscribe('visitorUsers', ()=> {
    return [this.getReactively('agencyId')]
  });

  this.helpers({
    visitors: ()=> {
      let selector = {
        'userData.agencyIds': {$elemMatch: {$eq: this.agencyId}},
        'roles': {$elemMatch: {$eq: 'visitor'}}
      };
      return VisitorUsers.find(selector,
        {
          limit: parseInt(this.getReactively('recordPerPage')),
          skip: parseInt((this.getReactively('page') - 1) * this.recordPerPage),
          sort: this.getReactively('sort')
        }
      );
    },
    visitorsCount() {
      return Counts.get('numberVisitorUsers');
    }
  });

  this.pageChanged = function (newPage) {
    this.page = newPage;
  };

  this.toggleSort = function (fieldname) {
    var newSort = {};
    this.order = -this.order;
    newSort[fieldname] = parseInt(this.order);
    this.sort = newSort;
  };

  this.addUser = () => {
    $state.go('register', {role: 'visitor'});
  };

  this.getUserDetails = (userId)=> {
    UserDetailsDialog.open(userId);
  };
});




