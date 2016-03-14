/**
 * Created by sarahcoletti on 2/15/16.
 */
angular.module('visitry.mobile').controller('loginCtrl', function ($scope, $state, $reactive) {
  $reactive(this).attach($scope);

  this.credentials = {
    username: '',
    password: ''
  };

  this.error = '';

  this.login = () => {
    Meteor.loginWithPassword(this.credentials.username, this.credentials.password, (err) => {
      if (err) {
        console.log("username:" + this.credentials.username + " err: " + err);
        this.error = err;
      }
      else {
        console.log('Login success ' + this.credentials.username);
        $state.go('home');
      }
    });
  };
});