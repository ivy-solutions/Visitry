/**
 * Created by sarahcoletti on 2/24/16.
 */
angular.module('visitry').controller('browseVisitRequestsCtrl', function ($scope, $reactive, $location, $state, $ionicModal) {
  $reactive(this).attach($scope);
  this.showDelete = false;
  this.canSwipe = true;
  this.listSort = {
    requestedDate: 1
  };

  this.helpers({
     openVisits: () => {
      let selector = {
          'visitorId': {$exists: false},
          'requestedDate': {$gt: new Date()}
      };
      return Visits.find(selector);
    },
     users: () => { //I don't understand why I need this for getRequester to work
       return Meteor.users.find({});
     }
  });

  this.subscribe('visits');
  this.subscribe('users');

  ////////

  this.getRequester = function (visit) {
    if (!visit)
      return 'No such visit';
    var requester;
    if ( visit.requesterId ) {
      requester = Meteor.users.findOne({_id: visit.requesterId});
    } else if (visit.requesterUsername ) {
      requester = Meteor.users.findOne({username: visit.requesterUsername});
    }
    if (!requester)
      return 'No such user for ' + visit.requesterUsername? visit.requesterName : visit.requesterId;

    return requester;
  };

  this.viewUpcomingVisits = function () {
    $location.path("/visitor/upcoming");
  };

  this.visitDetails = function (id) {
    $state.go( 'visitDetails', {visitId: id} );
  };

/*
  this.showScheduleVisitModal = function (id) {
    ScheduleVisit.showModal(id);
  };
  this.hideScheduleVisitModal = function () {
    ScheduleVisit.hideModal();
  };
*/

  this.scheduleVisit = function(visit) {
    console.log("visit id:" + visit._id);
    $scope.visit = visit;
    $scope.modalCtrl.show();
  };

  $ionicModal.fromTemplateUrl(getModalHtml(), function(modal) {
    $scope.modalCtrl = modal;
  }, {
    scope: $scope,  // give the modal access to parent scope
    animation: 'slide-in-left'
  });


function getModalHtml() {
  if (Meteor.isCordova) {
    return '/packages/visitry-mobile/client/visits/schedule-visit/schedule-visit-modal.html'
  }
  else {
    return '/packages/vistry-browser/client/visits/schedule-visit/schedule-visit-modal.html'
  }

  }


});