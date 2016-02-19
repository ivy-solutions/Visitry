/**
 * Created by sarahcoletti on 2/17/16.
 */

angular.module('visitry').filter('displayName', function () {
  return function (user) {
    if (!user) {
      return '';
    }

    if (user.profile && user.profile.name) {
      return user.profile.name;
    }
    else if (user.emails) {
      return user.emails[0].address;
    }
    else {
      return user;
    }
  }
});