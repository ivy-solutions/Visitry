/**
 * Created by sarahcoletti on 2/23/16.
 */
import {logger} from '/client/logging'
import {Roles} from 'meteor/alanning:roles'

angular.module("visitry").controller('profileCtrl', function($scope, $reactive, $state,$ionicPopup,$log,$ionicLoading) {
  $reactive(this).attach($scope);

  this.helpers({
    currentUser: () => {
      var user = Meteor.user();
      return user;
    },
    isVisitor: () => {
      return Roles.userIsInRole(Meteor.userId(), 'visitor');
    },
     distance: () => {
       if (Meteor.user() && Meteor.user().userData && Meteor.user().userData.visitRange != null) {
         logger.verbose( "user visitRange:" + Meteor.user().userData.visitRange);
         return Meteor.user().userData.visitRange.toString();
       }
       return "1";
     }
  });

  this.locationPlaceholder = this.isVisitor ? "Location from which you will usually come" : "Usual visit location"
  var subscription = this.subscribe('userProfile');

  this.locationDetails;

  /////////
  this.isLocationValid = ()=> {
    if ( Meteor.userId() !== null ) {
      var userHasSelectedLocation = this.locationDetails != null && this.currentUser.userData.location.address != null && this.currentUser.userData.location.address.length > 0;
      var hasClearAddress = !this.locationDetails &&
        (!this.currentUser.userData.location || !this.currentUser.userData.location.address);
      return userHasSelectedLocation || hasClearAddress;
    }
    return false;
  };

  this.submitUpdate = (form) => {
    if(form.$valid && (this.isLocationValid() || form.location.$pristine==true )) {
      //location
      if (form.location.$touched) {
        // location is optional - can be blank or selected
        var newLocation = null;
        if (this.locationDetails) {
          newLocation = {
            name: this.currentUser.userData.location.address,
            formattedAddress: this.locationDetails.formatted_address,
            latitude: this.locationDetails.geometry.location.lat(),
            longitude: this.locationDetails.geometry.location.lng()
          };
        }

        logger.info("profile.submitUpdate update location: " + this.currentUser.userData.location.address + " " + JSON.stringify(this.locationDetails));
        Meteor.call('updateLocation', newLocation, (err) => {
          if (err) {
            return handleError(err);
          }
        });
      }

      //userData
      this.currentUser.userData.visitRange = parseInt(this.distance, 10);
      Meteor.call('updateUserData', this.currentUser.userData, (err) => {
        if (err) {
          return handleError(err);
        }
      });

      this.updateUserEmail();
      return this.submitSuccess(form);
    }
  };

  this.updateUserEmail = () => {
     Meteor.call('updateUserEmail', this.currentUser.emails[0].address, (err) => {
      if (err) {
        return handleError(err);
      }
    });
  };

  this.submitSuccess = function (form) {
    //clear form
    this.resetForm(form);

    if (Roles.userIsInRole(Meteor.userId(), 'visitor')) {
      $state.go('browseRequests');
    } else {
      $state.go('pendingVisits');
    }
  };


  this.disableTap = function () {
    // disable ionic data tap - for the google added elements
    container = document.getElementsByClassName('pac-container');
    angular.element(container).attr('data-tap-disabled', 'true');

    // leave input field if google-address-entry is selected
    angular.element(container).on("click", function () {
      document.getElementById('location').blur();
    });
    var clickblock = document.getElementsByClassName('click-block');
    angular.element(clickblock).attr('data-tap-disabled', 'true');

  };

  this.updatePicture = () => {
    logger.info( "profile.updatePicture for " + this.currentUser.username);
    MeteorCameraUI.getPicture({ width: 160, height: 160, quality:80 }, function (err, data) {
      if (err && (err.error == 'cancel' || err.reason == 'no image selected') ) {
        return;
      }

      if (err) {
        return handleError(err);
      }

      $ionicLoading.show({
        template: 'Updating picture...'
      });

      Meteor.call('updatePicture', data, (err) => {
        $ionicLoading.hide();
        if (err)
          handleError(err);
      });
    });
  };

  function handleError(err) {
    logger.info('userData save error ', err.reason);

    $ionicPopup.alert({
      title: 'Save failed',
      template: err.reason || 'Please try again',
      okType: 'button-positive button-clear'
    });
  }

  this.resetForm= function(form) {
    this.locationDetails = null;
    this.distance="1";
    this.isVisitor=false;
    form.$setUntouched();
    form.$setPristine();
    container = document.getElementsByClassName('pac-container');
    angular.element(container).remove();
    subscription.stop();
  };

});