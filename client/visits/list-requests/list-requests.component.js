/**
 * Created by sarahcoletti on 2/24/16.
 */
angular.module('visitry').directive('listRequests', function () {
  return {
    restrict: 'E',
    templateUrl: ()=> {
      if (Meteor.isCordova) {
        return '/packages/visitry-mobile/client/visits/list-requests/list-requests.html';
      } else {
        return '/packages/visitry-browser/client/visits/list-requests/list-requests.html';
      }
    },
    controllerAs: 'listRequests',
    controller: function ($scope, $stateParams, $reactive) {
      $reactive(this).attach($scope);
      this.showDelete = false;
      this.canSwipe = false;

      this.subscribe('availableVisits');
    }
  }
});