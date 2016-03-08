angular.module('visitry').directive('feedback', function () {
  return {
    restrict: 'E',
    templateUrl: ()=> {
      if (Meteor.isCordova) {
        return '/packages/visitry-mobile/client/feedback/feedback.html';
      } else {
        return '/packages/visitry-browser/client/feedback/feedback.html';
      }
    },
    controllerAs: 'feedback',
    controller: function ($scope, $reactive,$state, $stateParams) {
      $reactive(this).attach($scope);

      this.visit = Visits.findOne({_id:$stateParams.visitId});

      var feedbackResponse = {
        visitorId:'',
        requesterId:'',
        visitorRating: 0,
        visitorComments:'',
        visitRating:0,
        visitComments:'',
        visitId:''
      };

      this.visitorRating = {
        minRating: 1,
        iconOnColor: '#FF5461',
        iconOffColor: 'rgb(0, 0, 0)',
        callback: function (rating) {
          feedbackResponse.visitorRating=rating;
        }
      };

      this.visitRating = {
        minRating: 1,
        iconOnColor: '#FF5461',
        iconOffColor: 'rgb(0, 0, 0)',
        callback: function (rating) {
          feedbackResponse.visitRating=rating;
        }
      };
      this.submitFeedback = ()=>{
        //TODO: data validation here, add the user data

        Feedback.insert(feedbackResponse);
        $state.go('pendingVisits')
      }
    }
  }
});
