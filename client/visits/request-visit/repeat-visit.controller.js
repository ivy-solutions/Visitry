/**
 * Created by sarahcoletti on 9/11/17.
 */
import { Visit } from '/model/visits'
import {logger} from '/client/logging'

angular.module('visitry').controller('repeatVisitController', function ($scope, $stateParams, $reactive, RequestVisit, $state ) {
  $reactive(this).attach($scope);

  this.visitId= $stateParams.priorVisitId;
  this.visitorId;
  this.visitor;

  this.autorun (() => {
    if (this.visitId) {
      var visit = Visit.findOne({_id: this.visitId});
      if (visit) {
        this.visitorId = visit.visitorId;
        this.visitor = User.findOne({_id: visit.visitorId});
      } else {
        logger.error("Failed to find prior visit. id: " + this.visitId);
      }
    }
  });

  this.getVisitorImage = function () {
    return Meteor.myFunctions.getUserImage(this.visitorId);
  };

  this.scheduleVisit = function() {
    logger.info("visit to repeat:" + this.visitId);
    RequestVisit.showModal(this.visitId);
    $state.go('pendingVisits')
  };

  this.dismiss = function() {
    $state.go('pendingVisits')
  }

});

