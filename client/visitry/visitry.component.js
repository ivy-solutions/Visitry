/**
 * Created by sarahcoletti on 2/17/16.
 */
import { User } from '/model/users'
import {Visits} from '/model/visits'

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
    controller: function ($scope, $reactive, $state, $timeout, $ionicHistory) {
      $reactive(this).attach($scope);

      this.subscribe('userProfile');

      this.helpers({
        isVisitor: ()=> {
          if (Meteor.userId()) {
            var user = User.findOne({_id: Meteor.userId()});
            if ( user ) {
              return user.userData.role === 'visitor';
            }
          }
          return false;
        },
        feedbackOutstanding: ()=> {
          var feedback = Visits.find({
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
        Accounts.logout(function (err) {
          if (err) {
            console.log(err);
          }
          $ionicHistory.clearHistory();
          console.log('clearing history');
          $state.go('login');
        });
      };
    }
  }
});