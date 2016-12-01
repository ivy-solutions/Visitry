/**
 * Created by sarahcoletti on 2/17/16.
 */

angular.module('visitry.browser').controller('loginCtrl', function ($scope, $state, $reactive, $cookies) {
  $reactive(this).attach($scope);

  const handle = this.subscribe('userBasics');

  this.credentials = {
    email: '',
    password: ''
  };

  this.error = '';


  this.login = () => {
    Meteor.loginWithPassword(this.credentials.email, this.credentials.password, (err) => {
      if (err) {
        console.log(err);
        this.error = err;
      }
      else {
        var user = User.findOne({_id: Meteor.userId()}, {fields: {'userData.agencyIds': 1}});
        $cookies.put('agencyId', user.userData.agencyIds[0]);
        handle.stop();
        console.log('Login success ' + this.credentials.email + ' agency: ' + $cookies.get('agencyId'));
      }
    });
  };
});