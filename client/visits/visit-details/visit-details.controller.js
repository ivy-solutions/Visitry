/**
 * Created by sarahcoletti on 3/2/16.
 */
angular.module('visitry').controller('visitDetailsCtrl', function ($scope, $stateParams, $reactive, $location, $filter) {
  $reactive(this).attach($scope);

  this.visitId = $stateParams.visitId;
  this.visit

  this.subscribe('visits', function() {
    this.visit = Visits.findOne({_id: $stateParams.visitId});
  });
  this.subscribe('users');

  ////////
  this.close = () => {
    $location.path('/visitor/browseRequests');
  };

  this.getRequester = function () {
    return Meteor.users.findOne({_id: this.visit.requesterId});
  };

  this.getRequesterImage = function(visit) {
    var requester = this.getRequester();
    if ( typeof(requester.profile.picture) === 'undefined' ) {
        return "";
    } else {
      return requester.profile.picture;
    }
  };


  this.requesterInterests = () => {
    var requester = this.getRequester();
    console.log( "requester:" + requester.requesterId );
    if (requester.profile && requester.profile.interests)
      return requester.profile.interests;
    return '';
  };


});