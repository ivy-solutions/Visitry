/**
 * Created by sarahcoletti on 2/24/16.
 */
angular.module('visitry').controller('browseVisitRequestsCtrl', function ($scope, $reactive, $location) {
  $reactive(this).attach($scope);

  this.helpers({
     openVisits: () => {
      let selector = {
          'visitorId': {$exists: false},
          'requestedDate': {$gt: new Date()}
      };
      return Visits.find(selector);
    },
     users: () => { //I don't understand why I need this for getRequestor to work
       return Meteor.users.find({});
     }
  });

  this.subscribe('visits');
  this.subscribe('users');

  ////////

  this.getRequestor = function (visit) {
    if (!visit)
      return 'No such visit';
    let requestor = Meteor.users.findOne({username : visit.requestorUsername });
    if (!requestor)
      return 'No such user for ' + visit.requestorUsername;
    return requestor;
  };

  this.viewUpcomingVisits = function () {
    $location.path("/visitor/upcoming")
  };

});