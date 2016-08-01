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

  this.isRequester = function() {
    return this.visit && (Meteor.userId() == this.visit.requesterId)
  };

  this.getRequester = function () {
    if ( this.visit == undefined ) {
      return null;
    }
    if ( this.requester ) {
      return this.requester;
    }
    conosle.log( "requester not found - why not?");
    return Meteor.users.findOne({_id: this.visit.requesterId});
  };

  this.getBuddy = function( ) {
    if (this.isRequester() && this.visit.visitorId) {
      //show visitor
      return User.findOne({_id: this.visit.visitorId});
    } else {
      //show requester
      return this.getRequester();
    }
  }

  this.getRequesterImage = function() {
    var requester = this.getRequester();
    if (requester) {
      if (requester.userData.picture == undefined) {
        return "";
      } else {
        return requester.userData.picture;
      }
    }
  };
  this.getVisitorImage = function() {
    if ( this.visit.visitorId ) {
      var visitor = User.findOne({_id: this.visit.visitorId});
      if (visitor && visitor.userData) {
        if (visitor.userData.picture) {
          return visitor.userData.picture;
        }
      }
    }
    return "";
  };

  this.getBuddyImage = function() {
    var buddy = this.getBuddy();
    if (buddy) {
      if (buddy.userData.picture == undefined) {
        return "";
      } else {
        return buddy.userData.picture;
      }
    }
  };


  this.buddyInterests = () => {
    var buddy = this.getBuddy();
    if (buddy) {
      if (buddy.userData && buddy.userData.interests)
        return buddy.userData.interests;
    }
    return '';
  };

});