/**
 * Created by sarahcoletti on 2/17/16.
 */

angular.module('visitry.browser').controller('loginCtrl', function ($scope, $state, $reactive, $cookies) {
  $reactive(this).attach($scope);

  this.isUserDataReady = false;


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
        const handle = this.subscribe('userBasics', ()=>[], ()=> {
          var user = User.findOne({_id: Meteor.userId()}, {fields: {'userData.agencyIds': 1}});
          handle.stop();
          $cookies.put('agencyId', user.userData.agencyIds[0]);
          console.log('Login success ' + this.credentials.email + ' agency: ' + $cookies.get('agencyId'));
        });
      }
    });
  };
});