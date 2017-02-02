/**
 * Created by Daniel Biales on 1/31/17.
 */

angular.module('visitry').filter('capitalize', function() {
  return function(input, scope) {
    if (input!=null) {
      input = input.toLowerCase();
      return input.substring(0, 1).toUpperCase() + input.substring(1);
    }
  }
});