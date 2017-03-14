/**
 * Created by n0235626 on 3/22/16.
 */

import {logger} from '/client/logging'

Meteor.myFunctions = {
  //expects arr to be sorted by requested dates
  groupVisitsByRequestedDate: function (sortedVisits) {
    var dateGroupedVisits = [];
    sortedVisits.forEach(function (visit) {
      if (dateGroupedVisits.length && (new Date(+dateGroupedVisits[dateGroupedVisits.length - 1].date)).toDateString() === (new Date(+visit.requestedDate)).toDateString()) {
        dateGroupedVisits[dateGroupedVisits.length - 1].visits.push(visit);
      }
      else {
        dateGroupedVisits.push({"date": visit.requestedDate, "visits": [visit]})
      }
    });
    return dateGroupedVisits;
  },
  getUser: function (userId) {
    if (userId) {
      return User.findOne({_id: userId});
    } else {
      return null;
    }
  },
  getUserImage: function (userId) {
    var user = this.getUser(userId);
    if (user && user.userData && user.userData.picture)
      return user.userData.picture;
    else
      return "";
  },
  isRequester: function () {
    return hasRoleAnywhere('requester');
  },
  isVisitor: function () {
    return hasRoleAnywhere('visitor');
  },
  isAdministrator: function(){
    return hasRoleAnywhere('administrator');
  },
  isRequesterInAgency: function( userId, agencyId) {
    return Roles.userIsInRole(userId, ['requester'], agencyId);
  },
  isVisitorInAgency: function( userId, agencyId) {
    return Roles.userIsInRole(userId, ['visitor'], agencyId);
  },
  isAdministratorInAgency: function( userId, agencyId) {
    return Roles.userIsInRole(userId, ['administrator'], agencyId);
  },
  administersMultipleAgencies: function() {
    let agencies = Roles.getGroupsForUser(Meteor.userId());
    let administers = agencies.filter( function(agencyId){
      return Roles.userIsInRole(Meteor.userId(), 'administrator', agencyId) && agencyId !== 'noagency'
    });
    return administers.length > 1;
  },
  showCancelVisitConfirm: function (visit, $filter, $ionicPopup, $ionicListDelegate, $ionicHistory) {
    let cancelVisitMethod = (visit.requesterId === Meteor.userId()) ? 'visits.rescindRequest' : 'visits.cancelScheduled';
    let confirmMessage = '';
    if (visit.visitorId) {
      let otherParty = null;
      if (visit.requesterId === Meteor.userId()) {
        otherParty = User.findOne({_id: visit.visitorId}, {userData: 1});
      } else {
        otherParty = User.findOne({_id:visit.requesterId}, {userData:1});
      }
      confirmMessage = "Do you want to cancel your visit with " + $filter('firstNameLastInitial')(otherParty) + " on " + $filter('date')(new Date(visit.visitTime), 'MMMM d, h:mm') + "?"
    }
    else {
      confirmMessage = "Do you want to cancel your visit request for " + $filter('date')(new Date(visit.requestedDate), 'MMMM d') + "?";
    }
    let confirmPopup = $ionicPopup.confirm({
      template: confirmMessage,
      cancelText: 'No',
      okText: 'Yes'
    });
    confirmPopup.then((result)=> {
      if (result) {
        Meteor.call(cancelVisitMethod, visit._id, (err) => {
          if (err) {
            return handleError(err, $ionicPopup);
          } else {
            if (!['visits', 'pendingVisits', 'upcoming'].includes($ionicHistory.currentStateName())) {
              $ionicHistory.goBack(-1);
            }
          }
        });
      }
      else {
        $ionicListDelegate.closeOptionButtons();
      }
    });
  },
  membershipStatus: function (agencyId) {
    let status = 'noUser';
    if (Meteor.userId()) {
      const user = User.findOne({_id: Meteor.userId()}, {fields: { 'userData.agencyIds': 1, 'userData.prospectiveAgencyIds': 1}});
      if (user && user.userData) {
        const myAgencies = user.userData.agencyIds;
        const pendingAgencies = user.userData.prospectiveAgencyIds;
        if (myAgencies && myAgencies.includes(agencyId))
          status = "member";
        else if (pendingAgencies && pendingAgencies.includes(agencyId))
          status = "pendingMember";
        else
          status = "notMember";
      } else {
        status = "notMember";
      }
    }
    return status;
  }
};

function handleError(err, $ionicPopup) {
  logger.error('showCancelVisitConfirm error ', err);
  $ionicPopup.alert({
    title: err.reason || 'Cancel failed',
    template: 'Please try again',
    okType: 'button-positive button-clear'
  });
}

function hasRoleAnywhere( role ) {
  let isRoleAnywhere = false;
  let groups = Roles.getGroupsForUser(Meteor.userId());
  if ( groups.length == 0) {
    //user does not have a group yet
    isRoleAnywhere = Roles.userIsInRole(Meteor.userId(), role);
  } else {
    // true if is a visitor anywhere
    groups.forEach( function (group) {
      if ( Roles.userIsInRole(Meteor.userId(), role, group)) {
        isRoleAnywhere  = true;
      }
    })
  }
  return isRoleAnywhere;
}