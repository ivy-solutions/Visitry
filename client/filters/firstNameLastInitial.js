/**
 * Created by sarahcoletti on 2/17/16.
 */

angular.module('visitry').filter('firstNameLastInitial', function () {
  return function (user) {
    if (!user) {
      return '';
    }

    if (user.profile && (user.profile.firstName || user.profile.lastName) ) {
      if (user.profile.firstName && user.profile.lastName) {
        return user.profile.firstName + ' ' + user.profile.lastName[0] + '.';
      } else {
        if (user.profile.firstName) {
          return user.profile.firstName;
        } else {
          return user.profile.lastName;
        }
      }
    }
    else {
      return user;
    }
  }
});