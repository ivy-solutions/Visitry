/**
 * Created by sarahcoletti on 3/25/16.
 */
angular.module('visitry').controller('scheduleVisitModalCtrl', function ($scope, $reactive, $state) {
  $reactive(this).attach($scope);

    $scope.hideModal = function () {
      $scope.modalCtrl.hide();
    };
    $scope.removeModal = function () {
      $scope.modalCtrl.remove();
    };


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

  var selectedTime;


  this.submit = function (visit) {
    if (selectedTime) {
      Visits.update(visit._id,{
        $set: { visitorId: Meteor.userId(),
          visitTime: selectedTime}
      });
      hideScheduleVisitModal();
      $state.go('upcoming');
    }
  };

  this.cancel = function () {
    hideScheduleVisitModal();
  };

  function hideScheduleVisitModal() {
    $scope.hideModal();
  }

  function timePickerCallback(val) {
    if (typeof (val) === 'undefined') {
      console.log('Time not selected');
    } else {
      selectedTime = new Date(val * 1000);
      console.log('The time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
    }

  }

});
