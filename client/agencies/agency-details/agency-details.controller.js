/**
 * Created by sarahcoletti on 12/20/16.
 */
import { Agency } from '/model/agencies'
import { Enrollment } from '/model/enrollment'
import {logger} from '/client/logging'

angular.module('visitry').controller('agencyDetailsCtrl', function ($scope, $stateParams, $reactive, $state, ChangeMembership) {
  $reactive(this).attach($scope);

  this.groupId = $stateParams.groupId;
  this.membershipStatus = Meteor.myFunctions.membershipStatus($stateParams.groupId);
  this.agency

  this.subscribe('memberships', ()=> {
    return [Meteor.userId()]
  });

  this.helpers({
    agency: () => {
      this.agency = Agency.findOne({_id: $stateParams.groupId});
      return this.agency
    },
    enrollment: () => {
      return Enrollment.findOne({userId: Meteor.userId(), agencyId:$stateParams.groupId });
    }
  });

  ////////

  this.isMember = () => {
    return this.membershipStatus === 'member';
  };
  this.isPendingMember = () => {
    return this.membershipStatus === 'pendingMember';
  };
  this.isNotMember = () => {
    return this.membershipStatus ===  'notMember';
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
    var subject= "Note from " + (this.isMember() ? "member" : "prospective member");
    var to = this.agency.contactEmail;
    if (to) {
      window.open("mailto:" + to + '?subject=' + subject, '_system');
    }
  };

  this.browseToWebsite = function(){
    var page = this.agency.website;
    if (page) {
      window.open(page, '_system');
    }
  };

  this.canRequestMembership = () => {
    // visitors can be members of many groups, requesters, only one
    if ( !this.isMember() && Meteor.myFunctions.isVisitor() ) {
      return true;
    } else {
      return (Enrollment.find({userId: Meteor.userId()}).count() === 0);
    }
  };

  this.requestMembership = () => {
    ChangeMembership.showModal(this.agency, false);
    $state.go('agencyList');
  };
  this.revokeRequest = () => {
    ChangeMembership.showModal(this.agency, true);
    $state.go('agencyList');
  };

});