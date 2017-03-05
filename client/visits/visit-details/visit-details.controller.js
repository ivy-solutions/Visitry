/**
 * Created by sarahcoletti on 3/2/16.
 */
import { Visit } from '/model/visits'
import {logger} from '/client/logging'

angular.module('visitry').controller('visitDetailsCtrl', function ($scope, $stateParams, $reactive, $ionicPopup, $filter, $ionicListDelegate,$ionicHistory, ScheduleVisit) {
  $reactive(this).attach($scope);

  this.visitId = $stateParams.visitId;
  this.visit;
  this.requester;

  this.helpers({
    theVisit: () => {
      var visit = Visit.findOne({_id: $stateParams.visitId});
      if (visit) {
        this.visit = visit;
        this.requester = User.findOne({_id: visit.requesterId}, {userData: 1, emails:1});
      }
      return visit;
    }
  });

  ////////

  this.sendMail = function(){
    var formattedDate = this.visit.visitTime ? $filter('date')(new Date(this.visit.visitTime), 'MMMM d, h:mm') : $filter('date')(new Date(this.visit.requestedTime), 'MMMM d, h:mm');
    var subject= "Visit on " + formattedDate;
    var to;
    if ( this.visit.requesterId === Meteor.userId()) {
      to = this.visitorEmailLink()
    } else {
      to = this.requesterEmailLink()
    }
    if (to) {
      window.open(to + '?subject=' + subject, '_system');
    }
  };

  this.isVisitor = function () {
    return Meteor.myFunctions.isVisitor();
  };

  this.isRequester = function () {
    return Meteor.myFunctions.isRequester();
  };

  this.canCallRequester = function () {
    return (Meteor.myFunctions.isVisitor() && this.requester.userData && this.requester.userData.phoneNumber) ? true : false;
  };

  this.canCallVisitor = function () {
    var visitor = this.getVisitor();
    return (Meteor.myFunctions.isRequester() && visitor && visitor.userData && visitor.userData.phoneNumber) ? true : false;
  };

  this.requesterEmailLink = function () {
    var requester = this.getRequester();
    if (requester && requester.emails.length > 0) {
      return "mailto:" + requester.emails[0].address;
    }
    return "";
  };

  this.visitorEmailLink = function () {
    if (this.visit && this.visit.visitorId) {
      var visitor = User.findOne({_id: this.visit.visitorId});
      if (visitor && visitor.emails.length > 0) {
        return "mailto:" + visitor.emails[0].address;
      }
    }
    return "";
  };

  this.sendText = function(){
    var to;
    if ( this.visit.requesterId === Meteor.userId()) {
      to = this.visitorTextLink()
    } else {
      to = this.requesterTextLink()
    }
    if (to) {
      window.open(to, '_system');
    }
  };

  this.visitorTextLink = function () {
    var visitor = this.getVisitor();
    if (visitor && visitor.userData && visitor.userData.phoneNumber && visitor.userData.acceptSMS==true) {
      var phoneNumber = visitor.userData.phoneNumber.replace(/[^\d]/g, "");
      phoneNumber = phoneNumber[0] == '1' ? phoneNumber : '1' + phoneNumber
      return "sms://" + phoneNumber;
    }
    return "";
  };

  this.requesterTextLink = function () {
    var requester = this.getRequester();
    if (requester && requester.userData && requester.userData.phoneNumber && requester.userData.acceptSMS==true) {
      var phoneNumber = requester.userData.phoneNumber.replace(/[^\d]/g, "");
      phoneNumber = phoneNumber[0] == '1' ? phoneNumber : '1' + phoneNumber
      return "sms://" + phoneNumber;
    }
    return "";
  };

  this.getRequester = function () {
    if (this.visit === undefined) {
      return null;
    }
    if (this.requester) {
      return this.requester;
    }
    return User.findOne({_id: this.visit.requesterId}, {userData:1, emails:1});
  };

  this.getVisitor = function () {
    if (this.visit.visitorId) {
      return User.findOne({_id: this.visit.visitorId});
    }
  };

  this.getRequesterImage = function () {
    var requester = this.getRequester();
    if (requester && requester.userData && requester.userData.picture) {
      return requester.userData.picture;
    }
    return "";
  };
  this.getVisitorImage = function () {
    if (this.visit.visitorId) {
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
    if (user && user.userData && user.userData.phoneNumber) {
      var phoneNumber = user.userData.phoneNumber;
      var username = user.username;
      phoneNumber = phoneNumber.replace(/[^\d]/g, "");
      window.plugins.CallNumber.callNumber(function () {
      }, function (result) {
        logger.error('Error: ' + result + ' dialing phone number of user:' + username + ' phone: ' + phoneNumber);
        handleError(result);
      }, phoneNumber, true);
    }
  };

  this.getTimeSinceRequested = function (requestedTime) {
    return moment(requestedTime).fromNow();
  };

  this.showRequestersLocationNotes = () => {
    var amtheVisitor = this.visit.visitorId === Meteor.userId();
    var visitLocationIsFromRequesterProfile = this.requester.userData.location && this.visit.location.address === this.requester.userData.location.address;
    return amtheVisitor && visitLocationIsFromRequesterProfile;
  };

  function handleError(err) {
    var message = err == 'NoFeatureCallSupported' ? 'Device does not support calling.' : err;
    $ionicPopup.alert({
      title: 'Error',
      template: message,
      okType: 'button-positive button-clear'
    });
  }

  this.scheduleVisit = function() {
    ScheduleVisit.showModal(this.visit);
  };

  this.cancelVisit = ()=>{
    Meteor.myFunctions.showCancelVisitConfirm(this.visit,$filter,$ionicPopup,$ionicListDelegate,$ionicHistory);
  };
});