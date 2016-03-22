/**
 * Created by sarahcoletti on 2/23/16.
 */
angular.module("visitry").controller('profileCtrl', function($scope, $reactive, $state) {
  $reactive(this).attach($scope);

  let user = Meteor.user();

  this.username = user.username
  this.firstName = user && user.profile ? user.profile.firstName : '';
  this.lastName = user && user.profile ? user.profile.lastName : '';
  this.primaryEmail = user && user.emails ? user.emails[0].address : '';
  this.role = 'requester';


  /////////
   this.submitUpdate = () => {
    console.log("update name: " + this.firstName + " " + this.lastName + " updateEmail: " + this.primaryEmail + " as "+ this.role);
    if (_.isEmpty(this.firstName) && _.isEmpty(this.lastName)) return;

    Meteor.call('updateName', this.firstName, this.lastName, (err) => {
      if (err) return handleError(err);
    });

    Meteor.call('updateEmail', this.primaryEmail, (err) => {
      if (err) return handleError(err);
    });

    if (this.role == "visitor") {
      $state.go('browseRequests');
    } else {
      $state.go('pendingVisits');
    }
  };

  function updatePicture() {

  }

  function handleError(err) {
    $log.error('profile save error ', err);

    $ionicPopup.alert({
      title: err.reason || 'Save failed',
      template: 'Please try again',
      okType: 'button-positive button-clear'
    });
  }
});