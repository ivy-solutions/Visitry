/**
 * Created by sarahcoletti on 3/2/16.
 */
angular.module('visitry').controller('visitDetailsCtrl', function ($scope, $stateParams, $reactive, $location, $filter) {
  $reactive(this).attach($scope);

  this.visitId = $stateParams.visitId;
  this.helpers({
    visit: () => {
      console.log("id:" + $stateParams.visitId);
      return Visits.findOne({_id: $stateParams.visitId});
    }
  });

  this.subscribe('visits');
  this.subscribe('users');

  ////////
  this.close = () => {
    $location.path('/visitor/browseRequests');
  };

  this.getRequester = function () {
    return Meteor.myFunctions.getRequester(this.visit)
  };

  this.getRequesterImage = function(visit) {
    var requester = this.getRequester(visit);
    return requester.profile.picture ? requester.profile.picture : "";
  };


  this.requesterInterests = () => {
    let requester = this.getRequester();
    console.log( "requester:" + requester);
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