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
    controller: function ($scope, $reactive, $state, $stateParams) {
      $reactive(this).attach($scope);
      this.subscribe('visits');
      this.subscribe('users');

      var feedbackResponse = {
        visitorId: '',
        requesterId: Meteor.userId(),
        visitorRating: 0,
        visitorComments: '',
        visitRating: 0,
        visitComments: '',
        visitId: $stateParams.visitId
      };

      this.visitor = '';

      this.helpers({
        visit: ()=> {
          var v = Visits.findOne({_id: $stateParams.visitId});
          if (v) {
            feedbackResponse.visitorId = v.visitorId;
            this.visitor = Meteor.users.findOne({_id: v.visitorId});
          }
          return v
        }
      });

      this.visitorRating = {
        badStars: [
          {
            id: 1
          },
          {
            id: 2
          }, {
            id: 3
          }, {
            id: 4
          }, {
            id: 5
          }],
        goodStars: [],
        iconOnColor: '#FF5461',
        size: '64',
        selectStar: function (id) {
          this.badStars = this.goodStars.concat(this.badStars);
          this.goodStars = this.badStars.slice(0, id);
          this.badStars = this.badStars.slice(id);
          feedbackResponse.visitorRating=id;
        }
      };

      this.visitRating = {
        badStars: [
          {
            id: 1
          },
          {
            id: 2
          }, {
            id: 3
          }, {
            id: 4
          }, {
            id: 5
          }],
        goodStars: [],
        iconOnColor: '#FF5461',
        size: '64',
        selectStar: function (id) {
          this.badStars = this.goodStars.concat(this.badStars);
          this.goodStars = this.badStars.slice(0, id);
          this.badStars = this.badStars.slice(id);
          feedbackResponse.visitRating=id;
        }
      }
      this.submitFeedback = ()=> {
        //TODO: data validation here, add the user data
        console.log(feedbackResponse);
        var feedbackId = Feedback.insert(feedbackResponse);
        Visits.update(feedbackResponse.visitId, {$set: {feedbackId: feedbackId}}, {
          upsert: false,
          multi: false
        }, function (err, updates) {
          if (err) {
            console.log(err);
          }
          else {
            $state.go('pendingVisits')
          }
        })
      }
    }
  }
});
