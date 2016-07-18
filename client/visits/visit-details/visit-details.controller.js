/**
 * Created by sarahcoletti on 3/2/16.
 */
import { Visit } from '/model/visits'
import { User } from '/model/users'

angular.module('visitry').controller('visitDetailsCtrl', function ($scope, $stateParams, $reactive) {
  $reactive(this).attach($scope);

  this.visitId = $stateParams.visitId;
  this.visit;
  this.requester

  this.helpers({
    theVisit:() => {
      console.log("theVisit: " + $stateParams.visitId);
      var visit = Visit.findOne({_id: $stateParams.visitId});
      console.log( "visit:" + visit);
      if ( visit ) {
        console.log( "visit:" + JSON.stringify(visit));
        this.visit = visit;
        this.requester = User.findOne({_id: visit.requesterId});
      }
      return visit;
    }
  });

  ////////

  this.isVisitor = function() {
    if (this.visit && this.visit.visitorId && (Meteor.userId() == this.visit.visitorId)) {
      return true;
    }
    return false;
  };

  this.getRequester = function () {
    if ( this.visit == undefined ) {
      return null;
    }
    if ( this.requester ) {
      return this.requester;
    }
    return Meteor.users.findOne({_id: this.visit.requesterId});
  };

  this.getRequesterImage = function(visit) {
    var requester = this.getRequester();
    if (requester) {
      if (requester.userData.picture == undefined) {
        return "";
      } else {
        return requester.userData.picture;
      }
    }
  };


  this.requesterInterests = () => {
    var requester = this.getRequester();
    if (requester) {
      if (requester.userData && requester.userData.interests)
        return requester.userData.interests;
    }
    return '';
  };


});