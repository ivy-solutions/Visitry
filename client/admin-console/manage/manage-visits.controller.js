/**
 * Created by n0235626 on 12/29/16.
 */
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Visit,Visits } from '/model/visits'

angular.module('visitry.browser').controller('adminManageVisitsCtrl', function ($scope, $state, $reactive, $cookies, AdminVisitDetailsDialog) {
  $reactive(this).attach($scope);

  this.agencyId = $cookies.get('agencyId');
  this.recordPerPage = 10;
  this.page = 1;
  this.order = 1;
  this.sort = {
    'visitTime': this.order
  };
  this.today = new Date();

  this.subscribe('agencyVisits', ()=> {
    return [this.getReactively('agencyId')]
  });

  this.helpers({
    scheduledVisits: ()=> {
      let selector = {
        'visitTime': {$exists: true, $gt: new Date()},
        'agencyId': {$eq: this.agencyId},
        'inactive': {$exists: false}
      };
      return Visits.find(selector,
        {
          limit: parseInt(this.getReactively('recordPerPage')),
          skip: parseInt((this.getReactively('page') - 1) * this.recordPerPage),
          sort: this.getReactively('sort')
        }
      );
    },
    completedVisits: ()=> {
      let selector = {
        'visitTime': {$exists: true, $lt: new Date()},
        'agencyId': {$eq: this.agencyId},
        'inactive': {$exists: false}
      };
      return Visits.find(selector,
        {
          limit: parseInt(this.getReactively('recordPerPage')),
          skip: parseInt((this.getReactively('page') - 1) * this.recordPerPage),
          sort: this.getReactively('sort')
        }
      );
    },
    requestedVisits: ()=> {
      let selector = {
        'visitTime': {$eq: null},
        'requestedDate': {$gt: new Date()},
        'agencyId': {$eq: this.agencyId},
        'inactive': {$exists: false}
      };
      return Visits.find(selector,
        {
          limit: parseInt(this.getReactively('recordPerPage')),
          skip: parseInt((this.getReactively('page') - 1) * this.recordPerPage),
          sort: this.getReactively('sort')
        }
      );
    },
    visitsCount() {
      return Counts.get('numberAgencyVisits');
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

  this.getUser = Meteor.myFunctions.getUser;

  this.getVisitDetails= (visitId)=>{
    AdminVisitDetailsDialog.open(visitId);
  }

});