/**
 * Created by sarahcoletti on 2/15/16.
 */
angular.module("visitry.browser").controller('resetPasswordCtrl', function ($scope, $reactive, $state) {
    $reactive(this).attach($scope);

    this.credentials = {
      email: ''
    };

    this.error = '';

    this.reset = () => {
      Accounts.forgotPassword(this.credentials, (err) => {
        if (err) {
          console.log(err);
          this.error = err.reason;
        }
        else {
          this.credentials.email = '';
          $state.go('login');
        }
      });
    };
});