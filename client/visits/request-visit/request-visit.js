/**
 * Created by sarahcoletti on 2/18/16.
 */
angular.module('visitry').directive('requestVisit', function () {
  return {
    restrict: 'E',
    templateUrl: 'client/visits/request-visit/request-visit.html',
    controllerAs: 'requestVisit',
    controller: function ($scope, $stateParams, $reactive, $mdDialog) {
      $reactive(this).attach($scope);

      this.newVisitRequest = {};

      this.addNewVisitRequest = () => {
        this.newVisitRequest.requestor = Meteor.userId();
        Visits.insert(this.newVisitRequest);
        this.newVisitRequest = {};
        $mdDialog.hide();
      };

      this.close = () => {
        $mdDialog.hide();
      };

    }
  }
});