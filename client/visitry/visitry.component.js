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
    controller: function ($scope, $reactive, $state) {
      $reactive(this).attach($scope);

      this.helpers({
        isVisitor: ()=> {
          var user = User.findOne({_id: Meteor.userId()}, {fields: {'userData.role': 1}});
          if (user) {
            return user.userData.role === 'visitor';
          } else {
            return false;
          }
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
          $state.go('login');
        });
      };
    }
  }
});