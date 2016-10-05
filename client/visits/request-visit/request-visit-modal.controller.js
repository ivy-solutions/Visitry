import { Visit } from '/model/visits.js'
import {logger} from '/client/logging'

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
  this.autoCompleteOptions = {
    watchEnter: true,
    country: 'us'
  };

  this.userSubmitted = false;
  var currentUser;

  this.helpers({
    userLocation: ()=> {
      currentUser = User.findOne(Meteor.userId());
      if (currentUser.userData && currentUser.userData.location) {
        this.visitRequest.location.name = currentUser.userData.location.address;
      }
      return currentUser;
    }
  });

  this.isLocationValid = ()=> {
    if ( this.userSubmitted ) {
      //user has selected a location, or has a default location that matches what is on screen
      var hasSelectedLocation = this.visitRequest.location.details.geometry != null;
      var usingProfileLocation = currentUser.userData && currentUser.userData.location != null && currentUser.userData.location.address === this.visitRequest.location.name;
      return this.visitRequest.location.name.length > 0 && (
        hasSelectedLocation || usingProfileLocation)
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
          address: this.visitRequest.location.details.name + ", " + this.visitRequest.location.details.vicinity,
          formattedAddress: this.visitRequest.location.details.formatted_address,
          geo: {
            type: "Point",
            coordinates: [this.visitRequest.location.details.geometry.location.lng(), this.visitRequest.location.details.geometry.location.lat()]
          }
        }
      } else {
        newVisit.location = currentUser.userData.location;
      }
      logger.info("New visit request", newVisit);
      Meteor.call('visits.createVisit',newVisit, (err) => {
        if (err) return handleError(err);
      });
      hideRequestVisitModal();
    }
  };
  this.cancel = function () {
    this.location = { name:{}, details:{}}
    hideRequestVisitModal();
  };

  function hideRequestVisitModal() {
    //remove the blocks google added
    var container = document.getElementsByClassName('pac-container');
    angular.element(container).remove();
    RequestVisit.hideModal();
  }

  function handleError(err) {
    logger.error('new visit request save error ', err);

    $ionicPopup.alert({
      title: err.reason || 'Request failed',
      template: 'Please try again',
      okType: 'button-positive button-clear'
    });
  }

});
