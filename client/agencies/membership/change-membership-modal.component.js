import {logger} from '/client/logging'
import { Agency } from '/model/agencies'

angular.module('visitry').controller('changeMembershipModalCtrl', function ($scope, $reactive, $state, $ionicPopup, ChangeMembership) {
  $reactive(this).attach($scope);

  this.notes = "";

  this.submit = function (agency) {
    if (Meteor.myFunctions.membershipStatus(agency._id)==='pendingMember' ) {
      Meteor.call('revokeJoinRequest', agency._id, this.notes);
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
