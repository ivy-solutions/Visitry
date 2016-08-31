/**
 * Created by sarahcoletti on 2/17/16.
 */
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
    controller: function ($scope, $reactive, $state,$cookies) {
      $reactive(this).attach($scope);
      $scope.platform = ionic.Platform.platform();

      this.subscribe('userProfile');
      this.subscribe('visits');

      this.autorun(() => {
        $scope.connectionStatus = Meteor.status().status;
      });

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
        userName: ()=> {
          return User.findOne({_id: Meteor.userId()}, {fields: {'username': 1}});
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
          else{
            if(Meteor.isCordova) {
              $ionicHistory.clearHistory();
            }else{
              $cookies.remove('agencyId');
            }
            $state.go('login',{reload: true});
          }
        });
      };
    }
  }
});