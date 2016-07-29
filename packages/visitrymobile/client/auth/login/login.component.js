/**
 * Created by sarahcoletti on 2/15/16.
 */
angular.module('visitry.mobile').controller('loginCtrl', function ($scope, $state, $reactive, $ionicPopup) {
  $reactive(this).attach($scope);

  this.credentials = {
    username: '',
    password: ''
  };

  this.subscribe('userProfile');

  this.login = () => {
    Meteor.loginWithPassword(this.credentials.username, this.credentials.password, (err) => {
      if (err) {
        return handleError(err)
      }
      else {
        console.log('Login success ' + this.credentials.username + " id: " + Meteor.userId());
        this.credentials.username = '';
        this.credentials.password = '';
        var user = Meteor.user();
        var goto;
        if (!hasValidAgency()) {
          goto = 'agencyList'
        } else {
          goto = (user.userData && user.userData.role == 'visitor') ? 'browseRequests' : 'pendingVisits';
        }
        $state.go(goto);
      }
    });
  };
  this.createAccount = () => {
      $state.go('register');
  };

  function hasValidAgency() {
    var user = Meteor.user();
    //TODO should check the activeUntil fields of the agency to make sure it is still active
    return user.userData && user.userData.agencyIds && user.userData.agencyIds[0];
  }

  function handleError(err) {
      console.log('Authentication error ', err);

      $ionicPopup.alert({
        title: err.reason || 'User with that username and password not found.',
        template: 'Please try again',
        okType: 'button-positive button-clear'
      });
    };
});