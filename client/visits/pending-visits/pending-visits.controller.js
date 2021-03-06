/**
 * Created by sarahcoletti on 2/18/16.
 */
import { Visit } from '/model/visits'
import { Enrollment } from '/model/enrollment'
import {logger} from '/client/logging'

angular.module('visitry').controller('pendingVisitsCtrl',
  function ($scope, $stateParams, $reactive, $location, $ionicPopup,$ionicListDelegate,$ionicHistory, RequestVisit, $filter, $state, feedback, $window) {
  $reactive(this).attach($scope);

  this.showDelete = false;
  this.canSwipe = true;

  this.hasRequests = true;
  this.visits = null;
  this.hasAgency = true;
  this.isMembershipDataLoaded=false;

  this.subscribe('userdata');
  let enrollmentSubscription = this.subscribe('memberships', ()=> {
    return [Meteor.userId()]
  }, ()=> {
    this.isMembershipDataLoaded = true;
  });
  this.subscribe('userRequests');

  this.autorun( function() {
    var user = User.findOne({_id: Meteor.userId()}, {fields: {roles:1,'userData.agencyIds': 1}});
    if ( Meteor.userId()) {
        if ( user ) {
          this.hasAgency = user.hasAgency;
      }
      if (this.getReactively('hasAgency')) {
        this.visits = Visit.find({
          requesterId: Meteor.userId(),
          requestedDate: {$gte: new Date()}
        }, {sort: {requestedDate: 1} });
        this.hasRequests = this.visits.count() > 0;
      }

      this.isMembershipDataLoaded = enrollmentSubscription.ready();
    } else {
      this.hasAgency=true; //no user during logoff and do not want to display the 'join group' button
      this.isMembershipDataLoaded = false;
      feedback.stop()
    }
  });

  this.helpers({
    pendingVisits: ()=> {
      var hasAgency = this.getReactively('hasAgency');
      if (Meteor.userId() && this.getReactively('visits')) {
        return Meteor.myFunctions.groupVisitsByRequestedDate(this.visits);
      }
    },
    membershipPending: ()=> {
      let hasAgency = this.getReactively('hasAgency');
      let dataLoaded = this.getReactively('isMembershipDataLoaded');
      if (Meteor.userId()) {
        let application = Enrollment.findOne({userId: Meteor.userId(), approvalDate: null});
        return application;
      }
      return false;
     }
  });

  this.getVisitor = function (visit) {
    return User.findOne({_id: visit.visitorId},{userData:1});
  };

  this.showRequestVisitModal = function () {
    RequestVisit.showModal();
  };

  this.getTimeSinceRequested = function(requestedTime){
    return moment(requestedTime).fromNow();
  };
  this.getVisitorImage = function(visit) {
    if (visit.visitorId) {
      var visitor = this.getVisitor(visit);
      if ( visitor == undefined || visitor.userData == undefined || visitor.userData.picture == undefined ) {
        return "";
      }
      return visitor.userData.picture;
    }
    return "";
  };

  this.isToday = function(date) {
    let today = moment();
    let dateToCompare = moment(date);
    return today.isSame(dateToCompare, 'd');
  };

  this.showCancelVisitConfirm = function (visit) {
    Meteor.myFunctions.showCancelVisitConfirm(visit,$filter,$ionicPopup,$ionicListDelegate,$ionicHistory, $window);
  };

  this.visitDetails = function (id) {
    $state.go( 'visitDetails', {visitId: id} );
  };

  this.groups = function () {
    // go to agency list or first agency I applied to
    let enrollments = Enrollment.findOne({userId: Meteor.userId()});
    if ( enrollments ) {
      $state.go( 'agencyDetails', {groupId: enrollments.agencyId })
    } else {
      $state.go('agencyList');
    }
  };
});
