/**
 * Created by sarahcoletti on 2/24/16.
 */
angular.module('visitry').controller('listRequestsCtrl', function ($scope, $stateParams, $reactive) {
  $reactive(this).attach($scope);

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

  this.subscribe('visits');
  this.subscribe('users');

  ////////

  this.getRequestor = function (visit) {
    if (!visit)
      return 'got nothing';
    let requestor = Meteor.users.findOne({username : visit.requestorUsername });
    if (!requestor)
      return 'No such user';
    return requestor;
  };


});