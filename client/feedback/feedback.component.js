import { Visit } from '/model/visits'
import {Feedback} from '/model/feedback'
import {logger} from '/client/logging'


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
    controller: function ($scope, $reactive, $state, $stateParams, $ionicPopup, $window) {
      $reactive(this).attach($scope);
      this.subscribe('userdata');

      this.companionComments = '';
      this.visitComments = '';
      this.timeSpent = 60;

      var feedbackResponse = {
        visitorId: '',
        requesterId: '',
        submitterId: Meteor.userId(),
        companionRating: 0,
        companionComments: '',
        visitRating: 0,
        visitComments: '',
        visitId: $stateParams.visitId,
        timeSpent: -1
      };

      this.isVisitor = false;
      this.visitor = '';
      this.requester = '';
      this.userSubmitted = false;
      this.agencyId = '';

      this.helpers({
        visit: ()=> {
          if ($stateParams.visitId) {
            var v = Visit.findOne({_id: $stateParams.visitId});
            if (v) {
              feedbackResponse.visitorId = v.visitorId;
              this.visitor = User.findOne({_id: v.visitorId});
              this.requester = User.findOne({_id: v.requesterId});
              //if the current user is not the visitor for the visit, it may be the requester or someone acting on the requester's behalf
              this.isVisitor = this.visitor._id == Meteor.userId() ? true : false;
              this.agencyId = v.agencyId;
            } else {
              logger.error("Failed to find visit requiring feedback. id: " + $stateParams.visitId);
            }
            return v
          }
        }
      });

//TODO: create a directive that does this
      this.companionRating = {
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
          feedbackResponse.companionRating = id;
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
          feedbackResponse.companionComments = this.companionComments;
          feedbackResponse.visitComments = this.visitComments;
          feedbackResponse.timeSpent = parseInt(this.timeSpent);

          logger.info("Feedback submitFeedback: " + JSON.stringify(feedbackResponse));

          try {
            var feedback = new Feedback(feedbackResponse);
            feedback.validate(function (err) {
              if ( err )
                throw err;
            });
            Meteor.call('feedback.createFeedback', feedbackResponse, function (err) {
              if (err) {
                throw(err);
              }
            });
            if (this.isVisitor == true) {
              $state.go('visitorFeedbackList');
            }
            else {
              $state.go('pendingVisits');
            }
            window.plugins.toast.showWithOptions(
              {
                message: "Thank you for your feedback.",
                duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                position: "top",
                addPixelsY: 45  // added a  value to move it down a bit (default 0)
              });

            this.resetForm(form);
            if ($window.ga) { //google analytics
              $window.ga('send', {
                hitType: 'event',
                eventCategory: 'Feedback',
                eventAction: this.isVisitor ? 'visitor' : 'requester',
                dimension1: this.agencyId
              });
            }
          } catch (err) {
            this.handleError(err.reason)
          }
        }
      };

      this.resetForm= function(form) {
        this.userSubmitted = false;
        this.companionRating.goodStars = [];
        this.visitRating.goodStars = [];
        this.companionComments ="";
        this.visitComments="";
        this.timeSpent=-1;
        form.$setUntouched();
        form.$setPristine();
      };

      this.handleError = function (message) {
        logger.error('Submit feedback error: ', message);

        $ionicPopup.alert({
          title: 'Error',
          template: message,
          okType: 'button-positive button-clear'
        });
      }
    }
  }
});
