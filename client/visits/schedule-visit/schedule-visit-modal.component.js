/**
 * Created by sarahcoletti on 3/25/16.
 */
import { User } from '/model/users'

angular.module('visitry').controller('scheduleVisitModalCtrl', function ($scope, $reactive, $state, $ionicPopup) {
  $reactive(this).attach($scope);

    $scope.hideModal = function () {
      selectedTime = null;
      $scope.modalCtrl.hide();
    };
    $scope.removeModal = function () {
      $scope.modalCtrl.remove();
    };


  var timePicker = {
    inputEpochTime: 10* 60 *60,  //Optional - start time to display, 10am - but overriden by requestedDate
    step: 15,  //Optional - show 15 minute increments
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

  this.subscribe('visits');
  this.subscribe('userdata');

  this.visitorNotes = "";

  var selectedTime;

  this.submit = function (visit) {
    var time = this.getSelectedTime();
    if (time instanceof Date) {
      console.log( "requestedDate UTC:" + visit.requestedDate.toUTCString() + "locale: " + visit.requestedDate.toLocaleString());
      var date = visit.requestedDate;
      var visitDateTime = new Date( date.getFullYear(), date.getMonth(), date.getDate(),
        selectedTime.getUTCHours(),selectedTime.getUTCMinutes(),0,0);
       if ( visitDateTime > tomorrowFirstThing() ) {
         Meteor.call('visits.scheduleVisit', visit._id, visitDateTime, this.visitorNotes, (err) => {
           if (err) return handleError(err.reason);
         });
         this.hideScheduleVisitModal();
         $state.go('upcoming');
      } else {
        return this.handleError( "Schedule Time must be in future.")
      }
    } else {
      return this.handleError("Press schedule button to schedule visit.")
    }

  };

  function tomorrowFirstThing() {
    var tomorrowFirstThing = new Date();
    tomorrowFirstThing.setTime(tomorrowFirstThing.getTime() +  ( 24 * 60 * 60 * 1000));
    tomorrowFirstThing.setHours(0);
    tomorrowFirstThing.setMinutes(0);
    tomorrowFirstThing.setSeconds(0);
    tomorrowFirstThing.setMilliseconds(0);
    return tomorrowFirstThing
  }

  this.cancel = function () {
    this.hideScheduleVisitModal();
  };

  this.hideScheduleVisitModal = function()  {
    //clear form
    this.visitorNotes = "";
    $scope.hideModal();
  };

  this.getRequester = function (visit) {
    if ( typeof(visit) === 'undefined' ) {
        return null;
    }
    console.log( " getting requester from visit: " + visit );
    return User.findOne({_id: visit.requesterId});
  };

  this.getSelectedTime = function() {
    if (selectedTime) {
      var today = new Date();
      var scheduledTime = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(),
        selectedTime.getUTCHours(), selectedTime.getUTCMinutes(), 0, 0);
      console.log( "getSelectedTime()" + scheduledTime );
      return scheduledTime;
    } else {
      return "";
    }
  };

  this.setSelectedTime = function( time ) {
    selectedTime = time;
  };

  this.initTimePicker = function(requestedDate) {
    console.log( "requestedDate: " + requestedDate);
    timePicker.inputEpochTime = (requestedDate.getHours())* 60 *60;
  };

  function timePickerCallback(val) {
    if (typeof (val) === 'undefined') {
      console.log('Time not selected');
    } else {
      selectedTime = new Date(val * 1000);
      console.log('The time is '+ selectedTime.getUTCHours()+ ':' + selectedTime.getUTCMinutes()+ ' in UTC');
    }
  }

  this.handleError = function (message) {
    console.log('Error ', message);

    $ionicPopup.alert({
      title: message,
      template: 'Please try again',
      okType: 'button-positive button-clear'
    });
  }
});
