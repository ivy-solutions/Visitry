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

  this.approximateLocation = () => {
    let visit = this.visit;
    if ( visit && typeof visit.location === "object") {
      if ( typeof visit.location.name == "string") {
        // strip out street numbers
        var parts = visit.location.name.split(',');
        var numParts = parts.length;
        if ( numParts >=2 ) {
          var inexactAddress = parts[0].match(/\D+/);
          for (i = 1; i < parts.length-2; i++) {
            inexactAddress += "," + parts[i].match(/\D+/);
          }
          return inexactAddress;
        }
        else {
          // less than 2 parts - must just be town
          return visit.location.name;
        }
      }
    }
    return '';
  }

});