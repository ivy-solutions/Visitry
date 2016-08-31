/**
 * Created by sarahcoletti on 2/17/16.
 */
import {logger} from '/client/logging'

angular.module('visitry').filter('firstNameLastInitial', function () {

  return function (user) {
    if (!user ) {
      return '';
    }

    if ( typeof(user.userData) === 'undefined')
      return user.username;

    if ( user.userData.firstName || user.userData.lastName ) {
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
      logger.info ( "Using username, " + user.username + " for " + user._id);
      return user.username;
    }
  }
});