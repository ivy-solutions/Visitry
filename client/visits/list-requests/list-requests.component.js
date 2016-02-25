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
      this.canSwipe = true;
      this.listSort = {
        date: 1
      };
      this.subscribe('visits');

      //TODO need future requests that are not taken
      this.helpers({
        openVisitRequests: ()=> {
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