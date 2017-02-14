/**
 * Created by sarahcoletti on 2/13/17.
 */
import {logger} from '/client/logging'

angular.module('visitry').controller('editRegistrationCtrl', function ($scope, $reactive, $timeout, $ionicPopup, EditRegistration) {
  $reactive(this).attach($scope);

  this.currentUser = Meteor.user();
  this.registrationInfo = {
    userData: {
      firstName: this.currentUser.userData.firstName,
      lastName: this.currentUser.userData.lastName,
    },
    username: this.currentUser.username,
    email: this.currentUser.emails[0].address
  };

  this.submit = function () {
    Meteor.call('updateRegistrationInfo', Meteor.userId(), this.registrationInfo, (err) => {
      if (err) {
        return handleError(err);
      }
      hideEditRegistrationModal();
    });
 };

  this.cancel = function () {
    hideEditRegistrationModal();
  };

  function hideEditRegistrationModal() {
    EditRegistration.hideModal();
  }

  function handleError(err) {
    logger.error('save error ', err);

    $ionicPopup.alert({
      title: 'Submit failed',
      template: err.reason,
      okType: 'button-positive button-clear'
    });
  }

});
