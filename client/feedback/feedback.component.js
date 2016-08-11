import { Visit } from '/model/visits'
import { User } from '/model/users'
import {Feedback} from '/model/feedback'

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
      this.subscribe('userdata');

      this.userComments = '';
      this.visitComments = '';
      this.timeSpent = 60;

      var feedbackResponse = {
        visitorId: '',
        requesterId: Meteor.userId(),
        submitterId: Meteor.userId(),
        userRating: 0,
        userComments: '',
        visitRating: 0,
        visitComments: '',
        visitId: $stateParams.visitId,
        timeSpent: -1
      };

      this.visitor = '';
      this.requester = '';
      this.userSubmitted = false;

      this.helpers({
        visit: ()=> {
          var v = Visit.findOne({_id: $stateParams.visitId});
          if (v) {
            feedbackResponse.visitorId = v.visitorId;
            this.visitor = User.findOne({_id: v.visitorId});
            this.requester = User.findOne({_id: v.requesterId});
          }
          return v
        },
        isVisitor: ()=> {
          var user = User.findOne({_id: Meteor.userId()}, {fields: {'userData.role': 1}});
          if (user) {
            return user.userData.role === 'visitor';
          } else {
            return false;
          }
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
          feedbackResponse.userRating = id;
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

      this.submitFeedback = (form)=> {
        this.userSubmitted = true;
        if(form.$valid) {
          feedbackResponse.userComments = this.userComments;
          feedbackResponse.visitComments = this.visitComments;
          feedbackResponse.timeSpent = this.timeSpent;

          var feedback = new Feedback(feedbackResponse);
          feedback.save();
          var user = User.findOne({_id: Meteor.userId()}, {fields: {'userData.role': 1}});
          if (user.userData.role === 'requester') {
            Meteor.call('visits.attachRequesterFeedback', feedbackResponse.visitId, feedback._id, function (err, updates) {
              if (err) {
                console.log(err);
              }
              else {
                $state.go('pendingVisits');
              }
            });
          } else if (user.userData.role === 'visitor') {
            Meteor.call('visits.attachVisitorFeedback', feedbackResponse.visitId, feedback._id, function (err, updates) {
              if (err) {
                console.log(err);
              }
              else {
                $state.go('visitorFeedbackList');
              }
            });
          }
          this.resetForm(form);
        }
      };

      this.resetForm= function(form) {
        this.userSubmitted = false;
        this.visitorRating.goodStars = [];
        this.visitRating.goodStars = [];
        this.userComments ="";
        this.visitComments="";
        form.$setUntouched();
        form.$setPristine();
      };

    }
  }
});
