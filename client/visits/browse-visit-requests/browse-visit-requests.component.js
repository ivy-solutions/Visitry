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
     users: () => { //I don't understand why I need this for getRequester to work
       return Meteor.users.find({});
     }
  });

  this.subscribe('visits');
  this.subscribe('users');

  ////////

  this.getRequester = function (visit) {
    if (!visit)
      return 'No such visit';
    var requester;
    if ( visit.requesterId ) {
      requester = Meteor.users.findOne({_id: visit.requesterId});
    } else if (visit.requesterUsername ) {
      requester = Meteor.users.findOne({username: visit.requesterUsername});
    }
    if (!requester)
      return 'No such user for ' + visit.requesterUsername? visit.requesterName : visit.requesterId;

    return requester;
  };

  this.viewUpcomingVisits = function () {
    $location.path("/visitor/upcoming");
  };

  this.scheduleVisit = function(visit ) {
    var confirmMessage = '';
    var requesterName = $filter('firstNameLastInitial')(this.getRequester(visit));
    confirmMessage = "Schedule a visit with " + requesterName + "?";

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