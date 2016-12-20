import {logger} from '/client/logging'

angular.module('visitry').controller('changeMembershipModalCtrl', function ($scope, $reactive, $state, $ionicPopup, ChangeMembership) {
  $reactive(this).attach($scope);

  this.notes = "";

  this.submit = function (agency) {
    var to = agency.contactEmail;
    var from = Meteor.user().emails[0].address;
    var subject;
    var text;
    var user = User.findOne(Meteor.userId());
    console.log(user);
    var username = user && user.userData ? user.fullName : user.username;
    if (Meteor.myFunctions.isMemberOfAgency(agency._id) ) {
      subject = "Report Concern";
      text = username + " reports: " + this.notes;
    } else {
      subject = "Request to Join " + agency.name;
      text = username + " requests to join. " + (this.notes ? "Message: " + this.notes : "");
    }
    Meteor.call('sendEmail', to, from, subject, text);

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
