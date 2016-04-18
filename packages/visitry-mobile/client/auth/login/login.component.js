/**
 * Created by sarahcoletti on 2/15/16.
 */
angular.module('visitry.mobile').controller('loginCtrl', function ($scope, $state, $reactive, $ionicPopup) {
  $reactive(this).attach($scope);

  this.credentials = {
    username: '',
    password: ''
  };

  this.login = () => {
    Meteor.loginWithPassword(this.credentials.username, this.credentials.password, (err) => {
      if (err) {
        return handleError(err)
      }
      else {
        console.log('Login success ' + this.credentials.username);
        $state.go('browseRequests');
      }
    });
  };
  this.createAccount = () => {
      $state.go('register');
  };

  function handleError(err) {
      console.log('Authentication error ', err);

      $ionicPopup.alert({
        title: err.reason || 'User with that username and password not found.',
        template: 'Please try again',
        okType: 'button-positive button-clear'
      });
    };
});