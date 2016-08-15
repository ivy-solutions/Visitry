/**
 * Created by sarahcoletti on 2/17/16.
 */
import { User } from '/model/users'
import { Visit } from '/model/visits'

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
    controller: function ($scope, $reactive, $state) {
      $reactive(this).attach($scope);

      var subscription = this.subscribe('userProfile');
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
            requestedDate: {$lt: new Date()}
          });
          return feedback.count();
        },
        isLoggedIn: ()=> {
          console.log(Meteor.userId());
          return Meteor.userId() !== null;
        }
      });

      this.logout = () => {
        console.log("logout");
        Meteor.logout(function (err) {
          if (err) {
            console.log(err);
          }
          subscription.stop();
          //$ionicHistory.clearHistory();
          $state.go('login');
        });
      };
    }
  }
});