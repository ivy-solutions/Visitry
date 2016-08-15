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
      this.distance = this.isVisitor && user.userData.visitRange ? user.userData.visitRange.toString() : "10";
      return user;
    }
  });

  this.subscribe('userProfile');

  this.locationDetails;
  this.distance="1";

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
     console.log("update location: " + JSON.stringify(this.locationDetails));
     if(form.$valid && (this.isLocationValid() || (form.visitorLocation.$pristine==true && form.requesterLocation.$pristine==true) )) {

       console.log("update user: " + JSON.stringify(this.currentUser));

       this.currentUser.userData.visitRange = parseInt(this.distance, 10);
       Meteor.call('updateUserData', this.currentUser.userData, (err) => {
         if (err) return handleError(err);
       });

       if (form.visitorLocation.$pristine==false || form.requesterLocation.$pristine==false) { //if location has changed
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

         console.log("update location: " + this.currentUser.userData.location.address + " " + JSON.stringify(this.locationDetails));
         Meteor.call('updateLocation', newLocation, (err) => {
           if (err) return handleError(err);
         });
       }

       //clear form
       this.resetForm(form);

       if (this.currentUser.userData.role == "visitor") {
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
      document.getElementById('visitorLocation').blur();
    });
    angular.element(container).on("click", function () {
      document.getElementById('requesterLocation').blur();
    });

  };

  this.updatePicture = () => {
    console.log( "update picture for " + this.currentUser.username);
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
    $log.error('userData save error ', err);

    $ionicPopup.alert({
      title: err.reason || 'Save failed',
      template: 'Please try again',
      okType: 'button-positive button-clear'
    });
  }

  this.resetForm= function(form) {
    this.locationDetails = null;
    this.distance=1;
    this.isVisitor=false;
    form.$setUntouched();
    form.$setPristine();
  };

});