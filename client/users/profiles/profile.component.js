/**
 * Created by sarahcoletti on 2/23/16.
 */
angular.module("visitry").controller('profileCtrl', function($scope, $reactive, $state,$ionicPopup,$log,$ionicLoading) {
  $reactive(this).attach($scope);

   this.helpers({
    currentUser: () => {
      return Meteor.user();
    }
  });

  this.subscribe('userProfile');

  /////////
  this.isLocationValid = ()=> {
    return this.currentUser.userData.location && this.currentUser.userData.location.name && this.currentUser.userData.location.details;
  };

   this.submitUpdate = () => {
     var user = this.currentUser;

     console.log("update user: " + JSON.stringify(user));
     var newUserData = {
       role: user.userData.role,
       vicinity: user.userData.vicinity
     };

     Meteor.call('updateUserData', newUserData, (err) => {
       if (err) return handleError(err);
     });

     if (this.isLocationValid()) {
       console.log("update location: " + JSON.stringify(user.userData.location));
       var newLocation = {
         name: user.userData.location.name,
         latitude: user.userData.location.details.geometry.location.lat(),
         longitude: user.userData.location.details.geometry.location.lng()
       };

        Meteor.call('updateLocation', newLocation, (err) => {
         if (err) return handleError(err);
       });
     }

     if (user.userData.role == "visitor") {
       $state.go('browseRequests');
     } else {
       $state.go('pendingVisits');
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

  this.updatePicture = () => {
    console.log( "update picture for " + this.currentUser.username);
    MeteorCameraUI.getPicture({ width: 160, height: 160, quality:80 }, function (err, data) {
      if (err && err.error == 'cancel') {
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
    $log.error('userData save error ', err);

    $ionicPopup.alert({
      title: err.reason || 'Save failed',
      template: 'Please try again',
      okType: 'button-positive button-clear'
    });
  }
});