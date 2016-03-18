/**
 * Created by sarahcoletti on 2/24/16.
 */
angular.module('visitry').controller('browseVisitRequestsCtrl', function ($scope, $reactive, $location, $filter, $ionicPopup) {
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
    $location.path("/visitor/upcoming");
  };

  this.scheduleVisit = function(visit ) {
    var confirmMessage = '';
    var requestorName = $filter('firstNameLastInitial')(this.getRequestor(visit));
    confirmMessage = "Schedule a visit with " + requestorName + "?";

    var confirmPopup = $ionicPopup.confirm({
      template: confirmMessage,
      cancelText: 'Cancel',
      okText: 'Yes'
    });
    confirmPopup.then((result)=> {
      if (result) {
        Visits.update(visit._id,{
          $set: { visitorId: Meteor.userId(),
          visitTime: visit.requestedDate} //TODO until time selector implemented
        });
        $location.path("/visitor/upcoming");
      }
    })

  }

});