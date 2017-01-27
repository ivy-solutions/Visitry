import {logger} from '/client/logging'
angular.module('visitry').directive('disableTap', function($timeout) {
 return {
    link: function() {
      $timeout(function($scope, $el) {
        var container = document.getElementsByClassName('pac-container');
        // disable ionic data tab - (needed for google autocomplete to work with ionic)
        for(var i=0; i < container.length; i++) {
          var eachPacContainer = document.getElementsByClassName('pac-container')[i];
          var setting = angular.element(eachPacContainer).attr('data-tap-disabled');
          if (setting == undefined) {
            angular.element(eachPacContainer).attr('data-tap-disabled', 'true');
          }
        };

        var backdrop = document.getElementsByClassName('backdrop');
        angular.element(backdrop).attr('data-tap-disabled', 'true');

       },1000);

    }
  };
});