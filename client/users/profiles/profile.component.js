/**
 * Created by sarahcoletti on 2/23/16.
 */
angular.module("visitry").controller('profileCtrl', function($scope, $reactive, $state) {
  $reactive(this).attach($scope);

  let user = Meteor.user();

  this.username = user ? user.username : '';
  this.firstName = user && user.profile ? user.profile.firstName : '';
  this.lastName = user && user.profile ? user.profile.lastName : '';
  this.primaryEmail = user && user.emails ? user.emails[0].address : '';
  this.location = {
      name: '',
      details: {}
  };
  this.vicinity = user ? user.vicinity : 2;
  this.vicinityOptions = ['2 miles', '5 miles', '10 miles', '20 miles','50 miles'];
  this.role = 'requester';

  var submitPressed = false;

  /////////
   this.submitUpdate = () => {
     submitPressed=true;
     if (this.isLocationValid() && this.isNameValid() ) {
       console.log("update name: " + this.firstName + " " + this.lastName + " updateEmail: " + this.primaryEmail + " as " + this.role);

       Meteor.call('updateName', this.firstName, this.lastName, (err) => {
         if (err) return handleError(err);
       });

       Meteor.call('updateEmail', this.primaryEmail, (err) => {
         if (err) return handleError(err);
       });

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

  this.isLocationValid = ()=> {
    if ( submitPressed ) {
      return this.location.name && this.location.details.geometry;
    }
    return true;
  };
  this.isNameValid = ()=> {
    if ( submitPressed ) {
      return !(_.isEmpty(this.firstName)) && !(_.isEmpty(this.lastName));
    }
    return true;
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

  function updatePicture() {

  }

  function handleError(err) {
    $log.error('profile save error ', err);

    $ionicPopup.alert({
      title: err.reason || 'Save failed',
      template: 'Please try again',
      okType: 'button-positive button-clear'
    });
  }
});