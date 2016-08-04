/**
 * Created by sarahcoletti on 2/23/16.
 */
angular.module("visitry").controller('profileCtrl', function($scope, $reactive, $state,$ionicPopup,$log,$ionicLoading) {
  $reactive(this).attach($scope);

  this.isVisitor = false;

   this.helpers({
    currentUser: () => {
      var user = Meteor.user();
      this.isVisitor = user && user.userData && user.userData.role === 'visitor';
      console.log( "currentUser isVisitor:" + this.isVisitor);
      return user;
    }
  });

  this.subscribe('userProfile');

  this.locationName = "";
  this.locationDetails;

  /////////
  this.isLocationValid = ()=> {
    return this.locationDetails;
  };

   this.submitUpdate = () => {

     console.log("update user: " + JSON.stringify(this.currentUser));

     Meteor.call('updateUserData', this.currentUser.userData, (err) => {
       if (err) return handleError(err);
     });

     // location is optional
     if (this.isLocationValid()) {
       console.log("update location: " + this.currentUser.userData.location.address + " " + JSON.stringify(this.locationDetails));
       var newLocation = {
         name: this.currentUser.userData.location.address,
         formattedAddress: this.locationDetails.formatted_address,
         latitude: this.locationDetails.geometry.location.lat(),
         longitude: this.locationDetails.geometry.location.lng()
       };

        Meteor.call('updateLocation', newLocation, (err) => {
         if (err) return handleError(err);
       });
     }

     if (this.currentUser.userData.role == "visitor") {
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
}).directive('convertToNumber', function() {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function (val) {
        return parseInt(val, 10);
      });
      ngModel.$formatters.push(function (val) {
        return '' + val;
      });
    }
  };
});