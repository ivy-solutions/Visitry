/**
 * Created by sarahcoletti on 8/3/16.
 */
angular.module('visitry').filter('streetAddress', function () {
  return function(location) {
    if ( !location )
      return "No Location";

    var parts = location.formattedAddress.split(',');
    return parts[0] + ", " + parts[1]
  }
});