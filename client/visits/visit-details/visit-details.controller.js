/**
 * Created by sarahcoletti on 3/2/16.
 */
angular.module('visitry').controller('visitDetailsCtrl', function ($scope, $stateParams, $reactive, $location) {
  $reactive(this).attach($scope);

  this.visitId = $stateParams.visitId;
  this.helpers({
    visit: () => {
      console.log("id:" + $stateParams.visitId);
      return Visits.findOne({_id: $stateParams.visitId});
    },
    visitrequester: () => {
      let visit = Visits.findOne({_id : this.visitId});
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
    }
  });

  this.subscribe('visits');
  this.subscribe('users');

  ////////
  this.close = () => {
    $location.path('/visitor/browseRequests');
  };

  this.requesterInterests = () => {
    let requester = this.visitrequester;
    console.log( "requester:" + requester);
    return requester.profile.interests;
  }

});