/**
 * Created by sarahcoletti on 2/17/16.
 */

angular.module('visitry.browser').controller('loginCtrl', function ($scope, $state, $reactive) {
  $reactive(this).attach($scope);
  this.subscribe('userdata');

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
        console.log('Login success ' + this.credentials.email);
        var user = User.findOne({_id:Meteor.userId()},{fields:{'userData.agencyIds':1}});
        Session.set('agencyId',user.userData.agencyIds[0]);
        $state.go('adminHome');
      }
    });
  };
});