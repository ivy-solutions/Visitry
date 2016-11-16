/**
 * Created by sarahcoletti on 2/23/16.
 */
import {logger} from '/client/logging'
import {Roles} from 'meteor/alanning:roles'

angular.module("visitry").controller('profileCtrl', function($scope, $reactive, $state,$ionicPopup,$ionicLoading,$ionicHistory) {
  $reactive(this).attach($scope);

  this.helpers({
    currentUser: () => {
      var user = User.findOne({_id:Meteor.userId()}, {userData:1});
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

  this.locationPlaceholder = this.isVisitor ? "Location from which you will usually come" : "Usual visit location";

  this.location = {
    address: this.currentUser && this.currentUser.userData.location ? this.currentUser.userData.location.address : "",
    details: ""
  };

  /////////
  this.isLocationValid = ()=> {
    if ( Meteor.userId() !== null ) {
      var userHasSelectedLocation = this.location.details != null && this.location.address != null && this.location.address.length > 0;
      var hasClearAddress =  !this.location.address || this.location.address.length == 0 ;
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
        if (this.location.details) {
          newLocation = {
            name: this.location.details.name + ", " + this.location.details.vicinity,
            formattedAddress: this.location.details.formatted_address,
            latitude: this.location.details.geometry.location.lat(),
            longitude: this.location.details.geometry.location.lng()
          };
        }

        logger.info("profile.submitUpdate update location: " + this.location.address + " " + JSON.stringify(this.location.details));
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

      return this.submitSuccess(form);
    }
  };


  this.submitSuccess = function (form) {
    //clear form
    this.resetForm(form);

    logger.info($ionicHistory.backTitle());
    if ($ionicHistory.backView() != null && $ionicHistory.backTitle() !== 'Register') {
      $ionicHistory.goBack();
    } else {
      $ionicHistory.nextViewOptions({
        historyRoot: true
      });
      if (Roles.userIsInRole(Meteor.userId(), 'visitor')) {
        $state.go('browseRequests');
      } else {
        $state.go('pendingVisits');
      }
    }
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
  };

});