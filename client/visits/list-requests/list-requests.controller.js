/**
 * Created by sarahcoletti on 2/24/16.
 */
angular.module('visitry').controller('listRequestsCtrl', function ($scope, $stateParams, $reactive) {
  $reactive(this).attach($scope);

  this.showDelete = false;
  this.canSwipe = false;

  this.subscribe('availableVisits');

  this.helpers({
    openVisits: () => {
       return Visits.find();
    }
  });

});