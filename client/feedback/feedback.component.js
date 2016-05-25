angular.module('visitry').directive('feedback', function () {
  return {
    restrict: 'E',
    templateUrl: ()=> {
      if (Meteor.isCordova) {
        return '/packages/visitrymobile/client/feedback/feedback.html';
      } else {
        return '/packages/visitry-browser/client/feedback/feedback.html';
      }
    },
    controllerAs: 'feedback',
    controller: function ($scope, $reactive,$state, $stateParams) {
      $reactive(this).attach($scope);
      this.subscribe('visits');
      this.subscribe('users');


      var feedbackResponse = {
        visitorId: '',
        requesterId:Meteor.userId(),
        visitorRating: 0,
        visitorComments:'',
        visitRating:0,
        visitComments:'',
        visitId: $stateParams.visitId
      };

      this.visitor = '';

      this.helpers({
        visit: ()=>{
          var v = Visits.findOne({_id:$stateParams.visitId});
          if(v){
            feedbackResponse.visitorId = v.visitorId;
            this.visitor = Meteor.users.findOne({_id:v.visitorId});
          }
          return v
        }
      });

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
        var feedbackId = Feedback.insert(feedbackResponse);
        Visits.update(feedbackResponse.visitId,{$set: {feedbackId: feedbackId}},{upsert:false,multi:false},function(err,updates){
          if(err){
            console.log(err);
          }
          else{
            $state.go('pendingVisits')
          }
        })
      }
    }
  }
});
