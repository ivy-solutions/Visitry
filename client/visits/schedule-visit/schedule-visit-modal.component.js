/**
 * Created by sarahcoletti on 3/25/16.
 */
angular.module('visitry').controller('scheduleVisitModalCtrl', function ($scope, $reactive, $state, $ionicPopup) {
  $reactive(this).attach($scope);

    $scope.hideModal = function () {
      $scope.modalCtrl.hide();
    };
    $scope.removeModal = function () {
      $scope.modalCtrl.remove();
    };


  $scope.timePickerObject = {
    //TODO use requestedDate.getTime()
    inputEpochTime: (new Date().getHours())* 60 *60,  //Optional - start time to display
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

  this.subscribe('visits');
  this.subscribe('users');

  var selectedTime;

  this.submit = function (visit) {
    if (selectedTime) {
      console.log( "requestedDate UTC:" + visit.requestedDate.toUTCString() + "locale: " + visit.requestedDate.toLocaleString());
      var date = visit.requestedDate;
      var visitDateTime = new Date( date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
        selectedTime.getUTCHours(),selectedTime.getUTCMinutes(),0,0);
      console.log ("setting visit time to " + visitDateTime );
      if ( visitDateTime > new Date()) {
        Visits.update(visit._id, {
          $set: {
            visitorId: Meteor.userId(),
            visitTime: visitDateTime
          }
        });
        hideScheduleVisitModal();
        $state.go('upcoming');
      } else {
        handleError( "Schedule Time must be in future.")
      }
    } else {
      handleError("Press schedule button to schedule visit. ")
    }

  };

  this.cancel = function () {
    hideScheduleVisitModal();
  };

  function hideScheduleVisitModal() {
    $scope.hideModal();
  }

  this.getRequester = function (visit) {
    return Meteor.users.findOne({_id: visit.requesterId});
  };

  this.getSelectedTime = function() {
    if (selectedTime) {
      var today = new Date()
      var dateAsLocal = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(),
        selectedTime.getUTCHours(), selectedTime.getUTCMinutes(), 0, 0);
      return dateAsLocal;
    } else {
      return "";
    }
  };

  function timePickerCallback(val) {
    if (typeof (val) === 'undefined') {
      console.log('Time not selected');
    } else {
      selectedTime = new Date(val * 1000);
      console.log('The time is '+ selectedTime.getUTCHours()+ ':', selectedTime.getUTCMinutes()+ 'in UTC');
    }
  }

  function handleError(message) {
    console.log('Error ', message);

    $ionicPopup.alert({
      title: message,
      template: 'Please try again',
      okType: 'button-positive button-clear'
    });
  }
});
