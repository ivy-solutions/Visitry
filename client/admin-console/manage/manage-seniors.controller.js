/**
 * Created by n0235626 on 8/31/16.
 */
import { Counts } from 'meteor/tmeasday:publish-counts';
import {Enrollment } from '/model/enrollment';
import {logger} from '/client/logging';

angular.module('visitry.browser').controller('adminManageSeniorsCtrl', function ($scope, $state, $reactive, $cookies, UserDetailsDialog) {
  $reactive(this).attach($scope);

  this.agencyId = $cookies.get('agencyId');
  this.recordPerPage = 10;
  this.page = 1;
  this.order = 1;
  this.sort = {
    'userData.lastName': this.order
  };
  this.subscribe('seniorUsers', ()=> {
    return [this.getReactively('agencyId')]
  });
  this.subscribe('members', ()=> {
    return [this.getReactively('agencyId')]
  });


  this.helpers({
    seniors: ()=> {
      let selector = {};
      selector['roles.'+this.getReactively('agencyId')] = 'requester';
      return Meteor.users.find(selector,
        {
          limit: parseInt(this.getReactively('recordPerPage')),
          skip: parseInt((this.getReactively('page') - 1) * this.getReactively('recordPerPage')),
          sort: this.getReactively('sort')
        }
      );
    },
    seniorsCount() {
      return Counts.get('numberSeniorUsers');
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
    $state.go('register', {role: 'requester'});
  };

  this.getUserDetails = (userId)=> {
    UserDetailsDialog.open(userId);
  };

  this.getJoinedDate = function (userId) {
    let enrollment = Enrollment.findOne({userId: userId, agencyId: this.agencyId});
    return enrollment ? enrollment.approvalDate : '';
  }
});

