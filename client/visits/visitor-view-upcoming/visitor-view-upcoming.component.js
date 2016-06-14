/**
 * Created by sarahcoletti on 3/13/16.
 */
angular.module('visitry').controller('visitorViewUpcomingCtrl', function ($scope, $reactive, $state,$ionicPopup,$ionicListDelegate, $filter) {
  $reactive(this).attach($scope);

  this.subscribe('visits');
  this.subscribe('users');

  this.showDelete = false;
  this.canSwipe = true;
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
      return visitsByDate;
    }
  });


  ////////

  this.getRequester = function (visit) {
    return Meteor.users.findOne({_id: visit.requesterId});
  };

  this.getRequesterImage = function(visit) {
    var requester = this.getRequester(visit);
    if ( requester === null || typeof(requester.userData) === 'undefined' || typeof(requester.userData.picture) === 'undefined' )
      return "";
    else
      return requester.userData.picture ? requester.userData.picture : "";
  };

  this.visitDetails = function (id) {
    $state.go( 'visitDetails', {visitId: id} );
  };

   this.cancelVisit = function (visit) {
    var confirmMessage = "Do you want to cancel your visit with " + $filter('firstNameLastInitial')(this.getRequester(visit)) + " on " + $filter('date')(new Date(visit.visitTime),'MMMM d, H:mm') + "?"
    var confirmPopup = $ionicPopup.confirm({
      template: confirmMessage,
      cancelText: 'No',
      okText: 'Yes'
    });
    confirmPopup.then((result)=> {
      if (result) {
        Visits.update(visit._id,
          {$set: { cancelledAt: new Date()},
            $unset: {visitorId: "", visitTime:""}
          }
        );
      }
      else{
        $ionicListDelegate.closeOptionButtons();
      }
    })
  }


});