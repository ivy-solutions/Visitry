/**
 * Created by sarahcoletti on 2/15/16.
 */
angular.module('visitry.mobile').controller('loginCtrl', function ($scope, $stateParams, $reactive) {
  $reactive(this).attach($scope);

  this.isStepTwo = false;
  this.phoneNumber = '';
  this.verificationCode = '';
  this.error = '';

  this.verifyPhone = () => {
    Accounts.requestPhoneVerification(this.phoneNumber);
    this.isStepTwo = true;
  };

  this.verifyCode = () => {
    Accounts.verifyPhone(this.phoneNumber, this.verificationCode, (err) => {
      if (err) {
        this.error = err;
      }
      else {
        $state.go('profile');
      }
    });
  }
});