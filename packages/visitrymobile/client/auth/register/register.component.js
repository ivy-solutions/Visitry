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
      this.role = 'requester';

      this.createAccount = (form) => {
        if(form.$valid) {
          Accounts.createUser(this.credentials, (err) => {
            if (err) {
              return handleError(err);
            }
            else {
              Meteor.call('updateName', this.firstName, this.lastName, this.role, (err) => {
                if (err) return handleError(err);
              });
              Meteor.loginWithPassword(this.credentials.username, this.credentials.password, (err) => {
                if (err) {
                  return handleError(err)
                }
                this.resetForm(form);
                $state.go('profile');

              });
            }
          })
        }
      };

      this.cancel = function (form) {
        this.resetForm(form);
        $state.go( 'login');
      };

      this.resetForm= function(form) {
        form.$setUntouched();
        form.$setPristine();
        this.firstName = '';
        this.lastName ='';
        this.credentials.username = '';
        this.credentials.password ='';
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