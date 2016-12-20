/**
 * Created by sarahcoletti on 12/20/16.
 */
import { Agency } from '/model/agencies'
import {logger} from '/client/logging'

angular.module('visitry').controller('agencyDetailsCtrl', function ($scope, $stateParams, $reactive, ChangeMembership) {
  $reactive(this).attach($scope);

  this.groupId = $stateParams.groupId;
  this.agency


  this.helpers({
    agency: () => {
      this.agency = Agency.findOne({_id: $stateParams.groupId});
      return this.agency
    }
  });

  ////////

  this.isMember = () => {
    return Meteor.myFunctions.isMemberOfAgency(this.groupId);
  };

  this.dialContact = () => {
    if (this.agency.contactPhone) {
      var phoneNumber = this.agency.contactPhone;
      phoneNumber = phoneNumber.replace(/[^\d]/g, "");
      window.plugins.CallNumber.callNumber(function () {
      }, function (result) {
        logger.error('Error: ' + result + ' dialing phone number : ' + phoneNumber);
        handleError(result);
      }, phoneNumber, true);
    }
  };

  this.sendMail = function(){
    var subject= "Note from " + this.isMember() ? "member" : "prospective member";
    var to = this.agency.contactEmail;
    if (to) {
      window.open(to + '?subject=' + subject, '_system');
    }
  };

  this.requestMembership = () => {
    ChangeMembership.showModal(this.agency, false);
  };

  this.reportConcern = () => {
    ChangeMembership.showModal(this.agency, true);
  }
});