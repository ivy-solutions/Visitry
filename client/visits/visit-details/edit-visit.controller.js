/**
 * Created by sarahcoletti on 9/26/17.
 */
/**
 * Created by sarahcoletti on 3/2/16.
 */
import { Visit } from '/model/visits'
import {logger} from '/client/logging'

angular.module('visitry').controller('editVisitCtrl', function ($scope, $stateParams, $reactive, $state) {
  $reactive(this).attach($scope);

  this.visitId = $stateParams.visitId;
  this.visit;
  this.requester;
  this.userSubmitted = false;

  var timePicker = {
    inputEpochTime: 10* 60 *60,  //Optional - start time to display, 10am - but overriden by requestedDate
    step: 5,  //Optional - show 5 minute increments
    format: 12,  //Optional - 12 hour time
    titleLabel: 'Visit Time',  //Optional
    setLabel: 'Set',  //Optional
    closeLabel: 'Close',  //Optional
    setButtonType: 'button-positive',  //Optional
    closeButtonType: 'button-stable',  //Optional
    callback: function (val) {    //Mandatory
      timePickerCallback(val);
    }
  };
  $scope.timePickerObject = timePicker;
  var editedTime;

  this.autorun (() => {
    var visit = Visit.findOne({_id: $stateParams.visitId});
    if (visit) {
      this.visit = visit;
      this.requester = User.findOne({_id: visit.requesterId}, {userData: 1, emails:1});
      timePicker.inputEpochTime = (visit.requestedDate.getHours())* 60 * 60 + ( visit.requestedDate.getMinutes() * 60);
    }
    return visit;
  });

  ////////

  this.isDateValid = ()=> {
    return Boolean(this.visit.requestedDate > new Date())
  };

  this.isVisitor = function () {
    return Meteor.myFunctions.isVisitor();
  };

  this.isRequester = function () {
    return Meteor.myFunctions.isRequester();
  };

  this.cancel = function () {
    this.visit = Visit.findOne({_id: $stateParams.visitId});  //restore data
    $state.go('login'); //will bring user to default view based on role
  };

  this.submit = function () {
    this.userSubmitted = true;
    if (this.isDateValid()) {
      if (editedTime) {
        this.visit.requestedDate.setHours(editedTime.getUTCHours());
        this.visit.requestedDate.setMinutes(editedTime.getUTCMinutes());
      }
      Meteor.call('visits.updateVisit', this.visit, (err) => {
        if (err) return handleError(err);
      });
      $state.go('login'); //will bring user to default view based on role
    }
  };

  this.getEditedTime = function() {
    if (editedTime) {
      this.visit.requestedDate.setHours(editedTime.getUTCHours());
      this.visit.requestedDate.setMinutes(editedTime.getUTCMinutes());
    }
    return this.visit.requestedDate;
  };

  function timePickerCallback(val) {
    if (typeof (val) === 'undefined') {
      logger.info('Time not selected');
    } else {
      editedTime = new Date(val * 1000);
    }
  }
});