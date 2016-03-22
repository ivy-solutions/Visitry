angular.module('visitry').controller('requestVisitModalCtrl', function ($scope, $reactive, $timeout, RequestVisit) {
  $reactive(this).attach($scope);
  $timeout(function(){
    if (GoogleMaps.loaded()) {
      $('#locationInput').geocomplete();
    }
  });
  this.visitRequest = {
    location: '',
    date: '',
    time: 0,
    notes: ''
  };


  this.submit = function () {
    var newVisit = {
      requesterId: Meteor.userId(),
      location: getLocation(this.visitRequest.location),
      requestedDate: (new Date(this.visitRequest.date)).setHours(this.visitRequest.time),
      notes: this.visitRequest.notes
    };
    console.log(newVisit);
    Visits.insert(newVisit);
    hideRequestVisitModal();
  };
  this.cancel = function () {
    hideRequestVisitModal();
  };

  function hideRequestVisitModal() {
    RequestVisit.hideModal();
  }
});

function getLocation(location) {
  //TODO: This function might not be necessary
  var coordinates = {
    latitude: 0,
    longitude: 0
  };
  if (location === 'Home') {
    //TODO: get home location from profile
    coordinates.latitude = 42.3601;
    coordinates.longitude = -71.0589;
  } else {
    //TODO: figure out how to get location from whatever they enter
  }
  return coordinates;
}
