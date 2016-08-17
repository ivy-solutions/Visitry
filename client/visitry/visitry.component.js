/**
 * Created by sarahcoletti on 2/17/16.
 */
import { User } from '/model/users'
import { Visit } from '/model/visits'
import {logger} from '/client/logging'

angular.module('visitry').directive('visitry', function () {
  return {
    restrict: 'E',
    templateUrl: () => {
      if (Meteor.isCordova) {
        return '/packages/visitrymobile/client/visitry/visitry.html';
      } else {
        return '/packages/visitry-browser/client/visitry/visitry.html';
      }
    },
    controllerAs: 'visitry',
    controller: function ($scope, $reactive, $state, $ionicHistory) {
      $reactive(this).attach($scope);

      var subscription = this.subscribe('userProfile');
      var subscription2 = this.subscribe('visits');

      this.helpers({
        isVisitor: ()=> {
          if (Meteor.userId()) {
            var user = User.findOne({_id: Meteor.userId()}, {fields: {'userData.role': 1}});
            if (user && user.userData) {
              return user.userData.role === 'visitor';
            }
          }
          return false;
        },
        feedbackOutstanding: ()=> {
          var feedback = Visit.find({
            visitorFeedbackId: null,
            visitorId: Meteor.userId(),
            visitTime: {$lt: new Date()}
          });
          return feedback.count();
        },
        isLoggedIn: ()=> {
          logger.info('visitry.isLoggedIn as : ' + Meteor.userId());
          return Meteor.userId() !== null;
        }
      });

      this.logout = () => {
        logger.info('visitry.logout userId: ' + Meteor.userId());
        Meteor.logout(function (err) {
          if (err) {
            logger.error('visitry.logout ' + err + ' logging user out userId: ' + Meteor.userId());
          }
          subscription.stop();
          subscription2.stop();
          $ionicHistory.clearHistory();
          $state.go('login');
        });
      };
    }
  }
});