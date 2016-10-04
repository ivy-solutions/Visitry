/**
 * Created by sarahcoletti on 3/2/16.
 */
import { Visit } from '/model/visits'
import {logger} from '/client/logging'

angular.module('visitry').controller('visitDetailsCtrl', function ($scope, $stateParams, $reactive, $ionicPopup) {
  $reactive(this).attach($scope);

  this.visitId = $stateParams.visitId;
  this.visit;
  this.requester;

  this.helpers({
    theVisit:() => {
      var visit = Visit.findOne({_id: $stateParams.visitId});
      if ( visit ) {
        this.visit = visit;
        this.requester = User.findOne({_id: visit.requesterId},{userData:1});
      }
      return visit;
    }
  });

  ////////

  this.isVisitor = function() {
    return Roles.userIsInRole(Meteor.userId(), ['visitor']);
  };

  this.isRequester = function() {
    return Roles.userIsInRole(Meteor.userId(),['requester']);
  };

  this.canCallRequester = function() {
    return (this.isVisitor() && this.requester.userData && this.requester.userData.phoneNumber)?true:false;
  };

  this.canCallVisitor = function() {
    var visitor = this.getVisitor();
    return (this.isRequester() && visitor && visitor.userData && visitor.userData.phoneNumber)?true:false;
  };

  this.getRequester = function () {
    if ( this.visit === undefined ) {
      return null;
    }
    if ( this.requester ) {
      return this.requester;
    }
    return User.findOne({_id: this.visit.requesterId});
  };

  this.getVisitor = function( ) {
    if (this.visit.visitorId) {
      return User.findOne({_id: this.visit.visitorId});
    }
  };

  this.getRequesterImage = function() {
    var requester = this.getRequester();
    if (requester && requester.userData  && requester.userData.picture) {
        return requester.userData.picture;
    }
    return "";
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

  this.userAboutInfo = (user) => {
    if (user && user.userData && user.userData.about) {
        return user.userData.about;
    }
    return 'No profile information provided.';
  };

  this.dialCompanion = (user) => {
    if ( user && user.userData && user.userData.phoneNumber) {
      var phoneNumber = user.userData.phoneNumber;
      var username = user.username;
      phoneNumber = phoneNumber.replace(/[^\d]/g, "");
      window.plugins.CallNumber.callNumber(function (){}, function (result) {
        logger.error('Error: '+ result + ' dialing phone number of user:' + username + ' phone: ' + phoneNumber);
        handleError(result);
      }, phoneNumber, true);
    }
  };

  this.getTimeSinceRequested = function(requestedTime){
    return moment(requestedTime).fromNow();
  };

  this.showRequestersLocationNotes = () => {
    var amtheVisitor = this.visit.visitorId === Meteor.userId();
    var visitLocationIsFromRequesterProfile = this.requester.userData.location && this.visit.location.address === this.requester.userData.location.address;
    return amtheVisitor && visitLocationIsFromRequesterProfile;
  };

  function handleError(err) {
    var message = err== 'NoFeatureCallSupported'? 'Device does not support calling.' : err;
    $ionicPopup.alert({
      title: 'Error',
      template: message,
      okType: 'button-positive button-clear'
    });
  }


});