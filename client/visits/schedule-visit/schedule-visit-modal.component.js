/**
 * Created by sarahcoletti on 3/25/16.
 */
import {logger} from '/client/logging'

angular.module('visitry').controller('scheduleVisitModalCtrl', function ($scope, $reactive, $state, $ionicPopup, $window, ScheduleVisit) {
  $reactive(this).attach($scope);


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

  this.subscribe('userdata');

  this.visitorNotes = "";

  var selectedTime;

  this.submit = function (visit) {
    var time = this.getSelectedTime();
    if (time instanceof Date) {
      var date = visit.requestedDate;
      var visitDateTime = new Date( date.getFullYear(), date.getMonth(), date.getDate(),
        selectedTime.getUTCHours(),selectedTime.getUTCMinutes(),0,0);
       if ( visitDateTime > new Date() ) {
         Meteor.call('visits.scheduleVisit', visit._id, visitDateTime, this.visitorNotes, (err) => {
           if (err) return handleError('Error', err.reason);
         });
         this.hideScheduleVisitModal();
         $state.go('upcoming');

         if ($window.ga) { //google analytics
           $window.ga('send', {
             hitType: 'event',
             eventCategory: 'Visit',
             eventAction: 'schedule',
             dimension1: visit.agencyId
           });
         }
      } else {
        return this.handleError( '', "Time must be in future.")
      }
    } else {
      return this.handleError('', "Press Set Time button to schedule visit.")
    }

  };

  this.cancel = function () {
    this.hideScheduleVisitModal();
  };

  this.hideScheduleVisitModal = function()  {
    //clear form
    this.visitorNotes = "";
    ScheduleVisit.hideModal()
  };

  this.getRequester = function (visit) {
    if ( typeof(visit) === 'undefined' ) {
        return null;
    }
    return User.findOne({_id: visit.requesterId});
  };

  this.getSelectedTime = function() {
    if (selectedTime) {
      var today = new Date();
      var scheduledTime = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(),
        selectedTime.getUTCHours(), selectedTime.getUTCMinutes(), 0, 0);
      return scheduledTime;
    } else {
      return "";
    }
  };

  this.setSelectedTime = function( time ) {
    selectedTime = time;
  };

  this.initTimePicker = function(requestedDate) {
    timePicker.inputEpochTime = (requestedDate.getHours())* 60 *60;
  };

  function timePickerCallback(val) {
    if (typeof (val) === 'undefined') {
      logger.info('Time not selected');
    } else {
      selectedTime = new Date(val * 1000);
      logger.info('The time is '+ selectedTime.getUTCHours()+ ':' + selectedTime.getUTCMinutes()+ ' in UTC');
    }
  }

  this.handleError = function (title, message) {
    logger.warn(title, message);

    $ionicPopup.alert({
      title: title,
      template: message,
      okType: 'button-positive button-clear'
    });
  }
});
