/**
 * Created by sarahcoletti on 2/23/16.
 */
import {logger} from '/client/logging'
import {Roles} from 'meteor/alanning:roles'
import {Agency} from '/model/agencies'

angular.module("visitry").controller('profileCtrl', function($scope, $reactive, $state,$ionicPopup,$ionicLoading,$ionicHistory, EditRegistration) {
  $reactive(this).attach($scope);

  this.currentUser = Meteor.user();
  this.isProfileReady = false;
  this.locationOptions = {
    country:"us",
    watchEnter: false
  };
  this.isLoadingPlaces = false; //true when retrieving info from Google Places

  this.subscribe('userProfile', ()=> {
    return [];
  }, ()=> {
    this.isProfileReady = true;
  });
  this.subscribe('myAgencies');

  this.autorun (() => {
    this.currentUser = User.findOne({_id: Meteor.userId()}, {fields: {
      username: 1, emails: 1, roles: 1, 'userData':1}}
    );
  });

  this.helpers({
    isVisitor: () => {
      return Roles.userIsInRole(Meteor.userId(), 'visitor');
    },
    distance: () => {
      if (Meteor.user() && Meteor.user().userData && Meteor.user().userData.visitRange != null) {
        return Meteor.user().userData.visitRange.toString();
      }
      return "1";
    },
    memberOfAgencies: () => {
      if (this.currentUser && this.currentUser.userData && this.currentUser.userData.agencyIds) {
        return Agency.find({_id: {$in: this.currentUser.userData.agencyIds}});
      }
    }

  });

  this.location = {
    address: (this.currentUser && this.currentUser.userData && this.currentUser.userData.location) ? this.currentUser.userData.location.address : "",
    details: null
  };

  this.isLocationValid = ()=> {
    if ( Meteor.userId() !== null ) {
      var hasClearAddress =  !this.location.address || this.location.address.length == 0 ;
      if (hasClearAddress) {
        return true;
      } else {
        var userHasSelectedLocation = this.location.details != null && this.location.address != null && this.location.address.length > 0;
        return userHasSelectedLocation;
      }
    }
    return false;
  };

  this.changeLocation = () => {
    this.isLoadingPlaces = this.location.address && this.location.address.length > 0;
    this.location.details = null;
  };

  this.submitUpdate = (form) => {
    if(form.$valid && (form.location.$pristine || this.isLocationValid())) {
      //location
       if (form.location.$dirty) {
        // location is optional - can be blank or selected
        var newLocation = null;
        if (this.location.address != null && this.location.address.length > 0 ) {
          if (this.location.details) {
            newLocation = {
              name: this.location.details.name + ", " + this.location.details.vicinity,
              formattedAddress: this.location.details.formatted_address,
              latitude: this.location.details.geometry.location.lat(),
              longitude: this.location.details.geometry.location.lng()
            };
          }
        }

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

    if ($ionicHistory.backView() != null && !['Register', 'Groups'].includes($ionicHistory.backTitle())) {
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
    logger.info( "profile.updatePicture for " + Meteor.userId());
    MeteorCameraUI.getPicture({ width: 160, height: 160, quality:80, correctOrientation: true, allowEdit:true, targetWidth:200, targetHeight:200 },
      function (err, data) {
        if (err && (err.error == 'cancel' || err.reason == 'no image selected')) {
          logger.info(err);
          return;
        }

        if (err) {
          return handleError(err);
        }

        $ionicLoading.show({
          template: 'Updating picture...'
        });

        Meteor.call('updatePicture',Meteor.userId(), data, (err) => {
          logger.info("picture updated");
          $ionicLoading.hide();
          if (err) {
            handleError(err);
          }
        });
      }
    );
  };

  this.groups = () => {
    $state.go('agencyList');
  };

  this.showNavigationToGroups = () => {
    //dont show, if we came from groups during registration process
    return !['Groups'].includes($ionicHistory.backTitle())
  };

  this.showEditRegistrationModal = function () {
    EditRegistration.showModal();
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
    this.isLoadingPlaces = false;
    form.$setUntouched();
    form.$setPristine();
    container = document.getElementsByClassName('pac-container');
    angular.element(container).remove();
  };

});