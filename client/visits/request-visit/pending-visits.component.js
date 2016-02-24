/**
 * Created by sarahcoletti on 2/18/16.
 */
angular.module('visitry').directive('pendingVisit', function () {
  return {
    restrict: 'E',
    templateUrl: ()=> {
      if (Meteor.isCordova) {
        return '/packages/visitry-mobile/client/visits/request-visit/pending-visits.html';
      } else {
        return '/packages/visitry-browser/client/visits/request-visit/pending-visits.html';
      }
    },
    controllerAs: 'pendingVisit',
    controller: function ($scope, $stateParams, $reactive, $mdDialog) {
      $reactive(this).attach($scope);
      this.showDelete = false;
      this.canSwipe = true;
      this.listSort = {
        date: 1
      };
      this.subscribe('visits');
      this.helpers({
        pendingVisits: ()=> {
          var visits = Visits.find({}, {sort: this.getReactively('listSort')});
          var dateSortedVisits = [];
          visits.forEach(function(visit){

            if (dateSortedVisits.length && (new Date(+dateSortedVisits[dateSortedVisits.length - 1].date)).getDate() === (new Date(+visit.date)).getDate()) {
              dateSortedVisits[dateSortedVisits.length - 1].visits.push(visit);
            }
            else {
              dateSortedVisits.push({"date": visit.date, "visits": [visit]})
            }
          });
          return dateSortedVisits;
        }
      });
    }
  }
});