angular.module('visitry').controller('requestVisitModalCtrl', function ($scope, $reactive, RequestVisit) {
  $reactive(this).attach($scope);

  this.visitRequest = {
    location: '',
    date: '',
    time: '',
    notes: ''
  };

  this.submit = function () {
    var newVisit = {
      requesterId: Meteor.userId(),
      location: getLocation(this.visitRequest.location),
      date: Date.parse(this.visitRequest.date) + (this.visitRequest.time * 3600000),
      notes: this.visitRequest.notes
    };
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
