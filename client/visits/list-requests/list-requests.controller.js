/**
 * Created by sarahcoletti on 2/24/16.
 */
angular.module('visitry').controller('listRequestsCtrl', function ($scope, $stateParams, $reactive) {
  $reactive(this).attach($scope);

  this.subscribe('visits');

  this.helpers({
    openVisits: () => {
      let selector = {
          'visitorId': {$exists: false},
          'date': {$gt: new Date()}
      };
      return Visits.find(selector);
    },
    myUpcomingVisits: () => {
      let selector = {
        'visitorId' : Meteor.userId()
      };
      return Visits.find(selector);
    }
  });


});