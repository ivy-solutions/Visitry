/**
 * Created by sarahcoletti on 4/2/16.
 */
angular.module('visitry').filter('streetAddressAndTown', function () {
  return function (location) {
    if (!location) {
      return 'No location Specified';
    }

    if ( location.name ) {
      var parts = location.name.split(',');
      if (parts.size() >= 2)
        return parts[0] + parts[1];
    }
    return location
  }
});