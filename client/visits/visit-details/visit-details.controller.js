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
    visitRequestor: () => {
      let visit = Visits.findOne({_id : this.visitId});
      if (!visit)
        return 'No such visit';
      let requestor = Meteor.users.findOne({username : visit.requestorUsername });
      if (!requestor)
        return 'No such user for ' + this.visit.requestorUsername;
      return requestor;
    }
  });

  this.subscribe('visits');
  this.subscribe('users');

  ////////
  this.close = () => {
    $location.path('/listRequests');
  };

  this.requestorInterests = () => {
    let requestor = this.visitRequestor;
    console.log( "requestor:" + requestor);
    return requestor.profile.interests;
  }

});