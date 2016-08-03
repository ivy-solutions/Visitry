import { Visit } from '/model/visits.js'
import { User } from '/model/users.js'

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

  this.userSubmitted = false;
  var currentUser;

  this.helpers({
    userLocation: ()=> {
      currentUser = User.findOne(Meteor.userId());
      console.log("currentUser" + JSON.stringify(currentUser));
      if (currentUser.userData && currentUser.userData.location) {
        this.visitRequest.location.name = currentUser.userData.location.address;
      }
      return currentUser;
    }
  });

  this.isLocationValid = ()=> {
    if ( this.userSubmitted ) {
      var hasSelectedLocation = this.visitRequest.location.details.geometry != null;
      var hasDefaultUserLocation = !(currentUser.userData.location == null);
      return this.visitRequest.location.name.length > 0 && (
        hasSelectedLocation || hasDefaultUserLocation )
    } else {
      return true;
    }
  };
  this.isDateValid = ()=> {
    if (this.userSubmitted) {
      return (this.visitRequest.date && this.visitRequest.date > new Date()) ? true : false;
    } else {
      return true;
    }
  };
  this.isTimeValid = ()=> {
    if (this.userSubmitted) {
      return this.visitRequest.time > 0 ? true: false;
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
    this.userSubmitted = true;
    if (this.isLocationValid() && this.isDateValid() && this.isTimeValid()) {
      var newVisit = new Visit({
        requestedDate: new Date(this.visitRequest.date.setHours(this.visitRequest.time)),
        notes: this.visitRequest.notes
      });
      //location from selection or from user default
      if ( this.visitRequest.location.details.geometry ) {
        newVisit.location = {
          address: this.visitRequest.location.name,
          formattedAddress: this.visitRequest.location.details.formatted_address,
          geo: {
            type: "Point",
            coordinates: [this.visitRequest.location.details.geometry.location.lng(), this.visitRequest.location.details.geometry.location.lat()]
          }
        }
      } else {
        newVisit.location = currentUser.userData.location;
      }
      console.log(newVisit);
      Meteor.call('visits.createVisit',newVisit, (err) => {
        if (err) return handleError(err);
      });
      hideRequestVisitModal();
    }
  };
  this.cancel = function () {
    hideRequestVisitModal();
  };

  function hideRequestVisitModal() {
    RequestVisit.hideModal();
  }

  function handleError(err) {
    console.log('account save error ', err);

    $ionicPopup.alert({
      title: err.reason || 'Request failed',
      template: 'Please try again',
      okType: 'button-positive button-clear'
    });
  }

});
