/**
 * Created by sarahcoletti on 4/18/16.
 */
angular.module('visitry').filter('approximateLocation', function () {
  return function(location) {
    if ( !location )
      return "No Location";

    var parts = location.name.split(',');
    var numParts = parts.length;
    if ( numParts >=2 ) {
      var inexactAddress = parts[0].replace(/^\d+/,'');
      for (var i = 1; i < parts.length-2; i++) {
        inexactAddress += "," + parts[i].replace(/^d+/,'');
      }
      return inexactAddress;
    }
    else {
      // less than 2 parts - must just be town
      return location.name;
    }
  }
});