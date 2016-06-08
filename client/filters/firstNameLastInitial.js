/**
 * Created by sarahcoletti on 2/17/16.
 */

angular.module('visitry').filter('firstNameLastInitial', function () {

  return function (user) {
    if (!user) {
      return '';
    }

    if (user.userData && (user.userData.firstName || user.userData.lastName) ) {
      if (user.userData.firstName && user.userData.lastName) {
        return user.userData.firstName + ' ' + user.userData.lastName[0] + '.';
      } else {
        if (user.userData.firstName) {
          return user.userData.firstName;
        } else {
          return user.userData.lastName;
        }
      }
    }
    else {
      console.log ( "Using username, " + user.username + " for " + user._id);
      return user.username;
    }
  }
});