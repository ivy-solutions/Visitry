/**
 * Created by sarahcoletti on 3/13/16.
 */
/**
 * Created by sarahcoletti on 2/24/16.
 */
angular.module('visitry').controller('visitorViewUpcomingCtrl', function ($scope, $reactive, $location) {
  $reactive(this).attach($scope);

  this.helpers({
    upcomingVisits: () => {
      var startOfToday = new Date();
      startOfToday.setHours(0,0,0,0);
      let selector = {
        'visitorId' : {$exists: true},
        'visitTime': {$exists: true},
        'visitTime': {$gt: startOfToday}
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

  this.viewRequests = function () {
    $location.path("/visitor/browseRequests")
  };


});