import { Visit } from '/model/visits'
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
        requesterId: '',
        submitterId: Meteor.userId(),
        userRating: 0,
        userComments: '',
        visitRating: 0,
        visitComments: '',
        visitId: $stateParams.visitId,
        timeSpent: -1
      };

      this.isVisitor = false;
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
            //if the current user is not the visitor for the visit, it may be the requester or someone acting on the requester's behalf
            this.isVisitor = this.visitor._id == Meteor.userId() ? true : false;
            console.log( "is Visitor" + this.isVisitor)
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
        if (form.$valid) {
          feedbackResponse.visitorId = this.visitor._id;
          feedbackResponse.requesterId = this.requester._id;
          feedbackResponse.userComments = this.userComments;
          feedbackResponse.visitComments = this.visitComments;
          feedbackResponse.timeSpent = parseInt(this.timeSpent);

          console.log("Feedback: " + JSON.stringify(feedbackResponse));

          var feedback = new Feedback(feedbackResponse);
          Meteor.call('feedback.createFeedback', feedbackResponse, function (err, returnValue) {
            if (err) {
              console.log( "submitFeedback error:", err);
              throw(err);
            }
            else {
              var feedbackId = returnValue;
              Meteor.call('visits.attachFeedback', feedbackResponse.visitId, feedbackId, function (err, updates) {
                if (err) {
                  console.log(err);
                }
                else {
                  console.log( "is Visitor2" + this.isVisitor)
                  if (this.isVisitor == true) {
                    $state.go('visitorFeedbackList');
                  }
                  else {
                    $state.go('pendingVisits');
                  }
                };
              });
              this.resetForm(form);
            }
          });
        }
      };

      this.resetForm= function(form) {
        this.userSubmitted = false;
        this.visitorRating.goodStars = [];
        this.visitRating.goodStars = [];
        this.userComments ="";
        this.visitComments="";
        this.timeSpent=-1;
        form.$setUntouched();
        form.$setPristine();
      };

    }
  }
});
