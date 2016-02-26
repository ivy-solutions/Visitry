/**
 * Created by sarahcoletti on 2/24/16.
 */
angular.module('visitry').controller('listRequestsCtrl', function ($scope, $stateParams, $reactive) {
  $reactive(this).attach($scope);

  this.showDelete = false;
  this.canSwipe = false;

  this.subscribe('visits');

  this.helpers({
    openVisits: () => {
      let selector = {
        'visitorId': {$exists: false}
      };
      return Visits.find(selector);
    }
  });

});