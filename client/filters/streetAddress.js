/**
 * Created by sarahcoletti on 8/3/16.
 */
angular.module('visitry').filter('streetAddress', function () {
  return function(location) {
    if ( !location )
      return "No Location";

    var parts = location.formattedAddress.split(',');
    var streetAddress = parts[0]
    if (parts.length> 1) {
      streetAddress += parts[1];
    }
    return streetAddress;
  }
});