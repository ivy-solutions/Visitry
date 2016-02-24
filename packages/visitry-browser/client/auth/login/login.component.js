/**
 * Created by sarahcoletti on 2/17/16.
 */
angular.module("visitry.browser").directive('login', function() {
  return {
    restrict: 'E',
    templateUrl: '/packages/visitry-browser/client/auth/login/login.html',
    controllerAs: 'login',
    controller: function ($scope, $reactive, $state) {
      $reactive(this).attach($scope);

      this.credentials = {
        email: '',
        password: ''
      };

      this.error = '';

      this.login = () => {
        Meteor.loginWithPassword(this.credentials.email, this.credentials.password, (err) => {
          if (err) {
            this.error = err
          }
          else {
            $state.go('profile')
          }
        });
      };

    }
  }
});