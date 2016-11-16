/**
 * Created by sarahcoletti on 2/15/16.
 */

angular.module('visitry.mobile').controller('loginCtrl', function ($scope, $state, $reactive, $ionicPopup) {
  $reactive(this).attach($scope);

  this.credentials = {
    username: '',
    password: ''
  };

  this.login = (form) => {
    var status = Meteor.status();
    if(status.connected==false ) {
      handleError( new Error("No connection to server." + status.status))
    }
    Meteor.loginWithPassword(this.credentials.username, this.credentials.password, (err) => {
      if (err) {
        return handleError(err)
      }
      else {
        console.log('Login success ' + this.credentials.username + " device: " + JSON.stringify(ionic.Platform.device()));
        this.resetForm(form);
      }
    });
  };
  this.createAccount = (form) => {
    this.resetForm(form);
    $state.go('register');
  };

  this.resetForm= function(form) {
    form.$setUntouched();
    form.$setPristine();
    this.credentials.username = '';
    this.credentials.password ='';
  };


  function hasValidAgency() {
    var user = Meteor.user();
    //TODO should check the activeUntil fields of the agency to make sure it is still active
    return user.userData && user.userData.agencyIds && user.userData.agencyIds[0];
  }

  function handleError(err) {
      console.log('Authentication error ', err);

      $ionicPopup.alert({
        title: err.reason || err || 'User with that username and password not found.',
        template: 'Please try again',
        okType: 'button-positive button-clear'
      });
    };
});