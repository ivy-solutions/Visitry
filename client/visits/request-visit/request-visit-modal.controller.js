angular.module('visitry').controller('requestVisitModalCtrl', function ($scope, $reactive, $timeout, RequestVisit) {
  $reactive(this).attach($scope);

  this.visitRequest = {
    location: {
      name: '',
      details: {}
    },
    date: '',
    time: 0,
    notes: ''
  };

  var userSubmitted = false;

  this.isLocationValid = ()=> {
    if (userSubmitted) {
      return this.visitRequest.location.name && this.visitRequest.location.details.geometry;
    } else {
      return true;
    }
  };
  this.isDateValid = ()=> {
    if (userSubmitted) {
      return this.visitRequest.date && this.visitRequest.date > new Date();
    } else {
      return true;
    }
  };
  this.isTimeValid = ()=> {
    if (userSubmitted) {
      return this.visitRequest.time;
    } else {
      return true;
    }
  };

  this.disableTap = function () {
    container = document.getElementsByClassName('pac-container');
    // disable ionic data tab
    angular.element(container).attr('data-tap-disabled', 'true');
    // leave input field if google-address-entry is selected
    angular.element(container).on("click", function () {
      document.getElementById('locationInput').blur();
    });
  };


  this.submit = function () {
    userSubmitted = true;
    if (this.isLocationValid() && this.isDateValid() && this.isTimeValid()) {
      var newVisit = {
        requesterId: Meteor.userId(),
        location: {
          name: this.visitRequest.location.name,
          latitude: this.visitRequest.location.details.geometry.location.lat(),
          longitude: this.visitRequest.location.details.geometry.location.lng()
        },
        requestedDate: (new Date(this.visitRequest.date)).setHours(this.visitRequest.time),
        notes: this.visitRequest.notes
      };
      console.log(newVisit);
      Visits.insert(newVisit);
      hideRequestVisitModal();
    }
  };
  this.cancel = function () {
    hideRequestVisitModal();
  };

  function hideRequestVisitModal() {
    RequestVisit.hideModal();
  }
});
