import {logger} from '/client/logging'

angular.module('visitry').controller('changeMembershipModalCtrl', function ($scope, $reactive, $state, $ionicPopup, ChangeMembership) {
  $reactive(this).attach($scope);

  this.notes = "";

  this.submit = function (agency) {
    if (Meteor.myFunctions.isMemberOfAgency(agency._id) ) {
      var to = agency.contactEmail;
      var user = User.findOne(Meteor.userId());
      var username = user && user.userData ? user.fullName : user.username;
      var from = Meteor.user().emails[0].address;
      var subject = "Report Concern";
      var text = username + " reports: " + this.notes;
      Meteor.call('sendEmail', to, from, subject, text);
    } else {
      Meteor.call('sendJoinRequest', agency._id, this.notes);
    }

    this.hideModal()
  };

  this.cancel = function () {
    this.hideModal();
  };

  this.hideModal = function()  {
    //clear form
    this.notes = "";
    ChangeMembership.hideModal()
  };


  this.handleError = function (title, message) {
    logger.warn(title, message);

    $ionicPopup.alert({
      title: title,
      template: message,
      okType: 'button-positive button-clear'
    });
  }
});
