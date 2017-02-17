/**
 * Created by sarahcoletti on 2/17/17.
 */
angular.module("visitry.browser").controller('replacePasswordCtrl', function ($scope, $stateParams, $reactive, $state) {
  $reactive(this).attach($scope);

  this.newPassword;
  this.token =  $stateParams.token;

  this.isDone = false;
  this.error = '';

  this.replace = () => {
    Accounts.resetPassword(this.token, this.newPassword, (err) => {
      if (err) {
        console.log(err);
        this.error = err.reason;
      } else {
        // Resume normal operation
        this.isDone=true;
      }
    });
  };
});