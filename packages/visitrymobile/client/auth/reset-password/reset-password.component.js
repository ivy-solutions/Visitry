/**
 * Created by sarahcoletti on 2/15/16.
 */
angular.module('visitry.mobile').controller('resetPasswordCtrl', function ($scope, $reactive, $state, $ionicPopup) {
    $reactive(this).attach($scope);

  this.credentials = {
    email: ''
  };

   this.reset = (form) => {
    Accounts.forgotPassword(this.credentials, (err) => {
      if (err) {
        handleError(err);
      }
      else {
        this.credentials.email = '';
        $state.go('login');
      }
    });
  };

  function handleError(err) {
    console.log('Reset Password error ', err);

    $ionicPopup.alert({
      title: err.reason || err || 'User with that email not found.',
      template: 'Please try again',
      okType: 'button-positive button-clear'
    });
  };

});