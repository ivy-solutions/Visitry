/**
 * Created by sarahcoletti on 4/7/16.
 */
angular.module("visitry.mobile").directive('register', function() {
  return {
    restrict: 'E',
    templateUrl: '/packages/visitrymobile/client/auth/register/register.html',
    controllerAs: 'register',
    controller: function ($scope, $reactive, $state, $ionicPopup ) {
      $reactive(this).attach($scope);

      this.credentials = {
        username: '',
        password: ''
      };
      this.firstName = '';
      this.lastName = '';

      this.createAccount = (form) => {
        if(form.$valid) {
          Accounts.createUser(this.credentials, (err) => {
            if (err) {
              return handleError(err);
            }
            else {
              Meteor.call('updateName', this.firstName, this.lastName, 'visitor', (err) => {
                if (err) return handleError(err);
              });
              Meteor.loginWithPassword(this.credentials.username, this.credentials.password, (err) => {
                if (err) {
                  return handleError(err)
                }
                $state.go('profile')
              });
            }
          })
        }
      };

      function handleError(err) {
        console.log('account save error ', err);

        $ionicPopup.alert({
          title: err.reason || 'Save failed',
          template: 'Please try again',
          okType: 'button-positive button-clear'
        });
      }


    }
  }
});