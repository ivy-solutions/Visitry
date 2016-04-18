/**
 * Created by sarahcoletti on 2/23/16.
 */
angular.module("visitry").controller('profileCtrl', function($scope, $reactive, $state,$ionicPopup,$log,$ionicLoading) {
  $reactive(this).attach($scope);

  this.username;
  this.firstName;
  this.lastName;
  this.primaryEmail;
  this.location = {
      name: '',
      details: {}
  };
  this.vicinity;
  this.vicinityOptions = ['2 miles', '5 miles', '10 miles', '20 miles','50 miles'];
  this.role = 'requester';
  this.picture;
  this.currentUser;

  this.subscribe('users', function () {
    this.currentUser = Meteor.user();
    if ( this.currentUser ) {
      this.username = this.currentUser.username;
      this.firstName = this.currentUser.userData ? this.currentUser.userData.firstName : '';
      this.lastName = this.currentUser.userData ? this.currentUser.userData.lastName : '';
      this.primaryEmail = this.currentUser.emails ? this.currentUser.emails[0].address : '';
      this.vicinity = this.currentUser.userData ? this.currentUser.userData.vicinity : 2;
      this.picture =  this.currentUser.userData.picture ? this.currentUser.userData.picture : '';
      this.location = this.currentUser.userData.location;
    }
  });

  /////////
   this.submitUpdate = () => {
     if (this.isLocationValid() ) {
       console.log("update name: " + this.firstName + " " + this.lastName + " updateEmail: " + this.primaryEmail + " as " + this.role);

       //Meteor.call('updateEmail', this.primaryEmail, (err) => {
       //  if (err) return handleError(err);
       //});

       console.log("update location: " + this.location.name);
       var newLocation = {
         name: this.location.name,
         latitude: this.location.details.geometry.location.lat(),
         longitude: this.location.details.geometry.location.lng()
       }
       var numMiles = this.vicinityOptions[this.vicinity].match(/\d+/);
       console.log( "update vicinity : " + numMiles);
       Meteor.call('updateLocation', newLocation, numMiles, (err) => {
         if (err) return handleError(err);
       });

       if (this.role == "visitor") {
         $state.go('browseRequests');
       } else {
         $state.go('pendingVisits');
       }
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
    MeteorCameraUI.getPicture({ width: 160, height: 160, quality:50 }, function (err, data) {
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