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

  this.login = (form) => {
    Meteor.loginWithPassword(this.credentials.username, this.credentials.password, (err) => {
      if (err) {
        return handleError(err)
      }
      else {
        console.log('Login success ' + this.credentials.username );
        this.resetForm(form);
        var user = Meteor.user();
        //TODO we will sometime handle unaffiliated users
        var goto;
        // if (!hasValidAgency()) {
        //   goto = 'agencyList'
        // } else {
        goto = (user.userData && user.userData.role == 'visitor') ? 'browseRequests' : 'pendingVisits';
        //}
        $state.go(goto);
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
        title: err.reason || 'User with that username and password not found.',
        template: 'Please try again',
        okType: 'button-positive button-clear'
      });
    };
});