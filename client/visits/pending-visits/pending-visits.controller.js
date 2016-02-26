/**
 * Created by sarahcoletti on 2/18/16.
 */
angular.module('visitry').controller('pendingVisitsCtrl', function ($scope, $stateParams, $reactive, $ionicPopup, RequestVisit) {
  $reactive(this).attach($scope);
  this.showDelete = false;
  this.canSwipe = true;
  this.listSort = {
    date: 1
  };

  this.subscribe('visits');

  this.helpers({
    pendingVisits: ()=> {
      var visits = Visits.find({}, {sort: this.getReactively('listSort')});
      var dateSortedVisits = [];
      visits.forEach(function (visit) {

        if (dateSortedVisits.length && (new Date(+dateSortedVisits[dateSortedVisits.length - 1].date)).getDate() === (new Date(+visit.date)).getDate()) {
          dateSortedVisits[dateSortedVisits.length - 1].visits.push(visit);
        }
        else {
          dateSortedVisits.push({"date": visit.date, "visits": [visit]})
        }
      });
      return dateSortedVisits;
    }
  });

  this.showRequestVisitModal = function () {
    RequestVisit.showModal();
  };
  this.hideRequestVisitModal = function () {
    RequestVisit.hideModal();
  };

  this.showCancelVisitConfirm = function (visit) {
    var confirmMessage = '';
    if (visit.visitorId) {
      confirmMessage = "Do you want to cancel your visit with " + visit.visitorId + "?"
    }
    else {
      confirmMessage = "Do you want to cancel your visit request on " + new Date(visit.date).toLocaleDateString("en-US");
    }
    var confirmPopup = $ionicPopup.confirm({
      template: confirmMessage,
      cancelText: 'No',
      okText: 'Yes'
    });
    confirmPopup.then((result)=> {
      if (result) {
        Visits.remove(visit._id);
      }
    })
  }

});
