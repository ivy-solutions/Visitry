/**
 * Created by sarahcoletti on 4/2/16.
 */
angular.module('visitry').filter('streetAddressAndTown', function () {
  return function (location) {
    if (!location) {
      return 'No location Specified';
    }

    var parts = visit.location.name.split(',');
    return parts[0] + parts[1];

  }
});