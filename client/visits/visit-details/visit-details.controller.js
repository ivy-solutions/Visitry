/**
 * Created by sarahcoletti on 3/2/16.
 */
angular.module('visitry').controller('visitDetailsCtrl', function ($scope, $stateParams, $reactive) {
  $reactive(this).attach($scope);

  this.visitId = $stateParams.visitId;
  this.visit;

  this.subscribe('visits', function() {
    this.visit = Visits.findOne({_id: $stateParams.visitId});
  });

  this.subscribe('userdata');

  ////////

  this.isVisitor = function() {
    if (this.visit && this.visit.visitorId && (Meteor.userId() == this.visit.visitorId)) {
      return true;
    }
    return false;
  };

  this.getRequester = function () {
    if ( this.visit == undefined ) {
      return null;
    }
    return Meteor.users.findOne({_id: this.visit.requesterId});
  };

  this.getRequesterImage = function(visit) {
    var requester = this.getRequester();
    if (requester) {
      if (requester.userData.picture == undefined) {
        return "";
      } else {
        return requester.userData.picture;
      }
    }
  };


  this.requesterInterests = () => {
    var requester = this.getRequester();
    if (requester) {
      if (requester.userData && requester.userData.interests)
        return requester.userData.interests;
    }
    return '';
  };


});