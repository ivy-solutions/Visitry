/**
 * Created by sarahcoletti on 3/13/16.
 */
/**
 * Created by sarahcoletti on 2/24/16.
 */
angular.module('visitry').controller('homeCtrl', function ($scope, $location) {

  this.asVisitor = function () {
    $location.path("/visitor/browseRequests");
  };

  this.asRequestor = function () {
    $location.path("/pendingVisits");
  };
});