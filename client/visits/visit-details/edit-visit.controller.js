/**
 * Created by sarahcoletti on 9/26/17.
 */
/**
 * Created by sarahcoletti on 3/2/16.
 */
import { Visit } from '/model/visits'
import {logger} from '/client/logging'

angular.module('visitry').controller('editVisitCtrl', function ($scope, $stateParams, $reactive, $state) {
  $reactive(this).attach($scope);

  this.visitId = $stateParams.visitId;
  this.visit;
  this.requester;
  this.userSubmitted = false;


  this.autorun (() => {
    var visit = Visit.findOne({_id: $stateParams.visitId});
    if (visit) {
      this.visit = visit;
      this.requester = User.findOne({_id: visit.requesterId}, {userData: 1, emails:1});
    }
    return visit;
  });

  ////////

  this.isDateValid = ()=> {
    return Boolean(this.visit.requestedDate > new Date())
  };

  this.isVisitor = function () {
    return Meteor.myFunctions.isVisitor();
  };

  this.isRequester = function () {
    return Meteor.myFunctions.isRequester();
  };

  this.cancel = function () {
    this.visit = Visit.findOne({_id: $stateParams.visitId});  //restore data
    $state.go('login'); //will bring user to default view based on role
  };

  this.submit = function () {
    this.userSubmitted = true;
    if (this.isDateValid()) {
      Meteor.call('visits.updateVisit', this.visit, (err) => {
        if (err) return handleError(err);
      });
      $state.go('login'); //will bring user to default view based on role
    }
  }


});