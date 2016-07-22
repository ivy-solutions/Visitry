import { Visit } from '/model/visits'
import { User } from '/model/users'
import {RequesterFeedbacks} from '/model/RequesterFeedback'

angular.module('visitry').directive('requesterFeedback', function () {
  return {
    restrict: 'E',
    templateUrl: ()=> {
      if (Meteor.isCordova) {
        return '/packages/visitrymobile/client/feedback/requesterFeedback.html';
      } else {
        return '/packages/visitry-browser/client/feedback/requesterFeedback.html';
      }
    },
    controllerAs: 'requesterFeedback',
    controller: function ($scope, $reactive, $state, $stateParams) {
      $reactive(this).attach($scope);
      this.subscribe('visits');
      this.subscribe('userdata');
      this.visitorComments = '';
      this.visitComments = '';

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
          var v = Visit.findOne({_id: $stateParams.visitId});
          if (v) {
            feedbackResponse.visitorId = v.visitorId;
            this.visitor = User.findOne({_id: v.visitorId});
          }
          return v
        }
      });
//TODO: create a directive that does this
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
          feedbackResponse.visitorRating = id;
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
          feedbackResponse.visitRating = id;
        }
      };

      this.submitFeedback = ()=> {
        console.log(feedbackResponse);
        feedbackResponse.visitorComments = this.visitorComments;
        feedbackResponse.visitComments = this.visitComments;
        var feedbackId = RequesterFeedbacks.insert(feedbackResponse);
        Meteor.call('visits.attachRequesterFeedback', feedbackResponse.visitId, feedbackId, function (err, updates) {
          if (err) {
            console.log(err);
          }
          else {
            $state.go('pendingVisits');
          }
        })
      }
    }
  }
});
