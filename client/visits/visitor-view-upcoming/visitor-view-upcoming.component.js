/**
 * Created by sarahcoletti on 3/13/16.
 */
angular.module('visitry').controller('visitorViewUpcomingCtrl', function ($scope, $reactive, $location, $state) {
  $reactive(this).attach($scope);

  this.showDelete = false;
  this.canSwipe = false;
  this.listSort = {
    visitTime: 1
  };

  this.helpers({
    upcomingVisits: () => {
      var startOfToday = new Date();
      startOfToday.setHours(0,0,0,0);
      let selector = {
        'visitorId' : Meteor.userId(),
        'visitTime': {$exists: true},
        'visitTime': {$gt: startOfToday}
      };
      var visits =  Visits.find(selector, {sort: this.getReactively('listSort')});
      var visitsByDate = Meteor.myFunctions.dateSortArray(visits);
      console.log( visitsByDate[0]);
      return visitsByDate;
    },
    users: () => { //I don't understand why I need this for getRequester to work
      return Meteor.users.find({});
    }
  });

  this.subscribe('visits');
  this.subscribe('users');

  ////////

  this.getRequester = function (visit) {
    return Meteor.users.findOne({_id: visit.requesterId});
  };

  this.getRequesterImage = function(visit) {
    var requester = this.getRequester(visit);
    return requester.profile.picture ? requester.profile.picture : "";
  };

  this.visitDetails = function (id) {
    console.log ('visitDetails of :' + id);
    $state.go( 'visitDetails', {visitId: id} );
  };

  this.cancelVisit = function (visit) {
    //TODO popup confirmation and then remove Visitor Id and visistTime
  };


});