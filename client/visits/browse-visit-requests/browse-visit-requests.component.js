/**
 * Created by sarahcoletti on 2/24/16.
 */
angular.module('visitry').controller('browseVisitRequestsCtrl', function ($scope, $reactive, $location, $state, $stateParams) {
  $reactive(this).attach($scope);

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

  $scope.timePickerObject = {
    inputEpochTime: ((new Date()).getHours() * 60 * 60),  //Optional
    step: 15,  //Optional
    format: 12,  //Optional
    titleLabel: 'Visit Time',  //Optional
    setLabel: 'Set',  //Optional
    closeLabel: 'Close',  //Optional
    setButtonType: 'button-positive',  //Optional
    closeButtonType: 'button-stable',  //Optional
    callback: function (val) {    //Mandatory
      timePickerCallback(val);
    }
  };

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

  this.showScheduleVisitModal = function (id) {
    ScheduleVisit.showModal(id);
  };
  this.hideScheduleVisitModal = function () {
    ScheduleVisit.hideModal();
  };

  this.setTime = function(id) {
    console.log("visit id:" + id);
  }

  function timePickerCallback(val) {
     if (typeof (val) === 'undefined') {
      console.log('Time not selected');
    } else {
      var selectedTime = new Date(val * 1000);
      console.log('The time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
    }

  }


});