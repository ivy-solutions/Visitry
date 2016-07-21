/**
 * Created by sarahcoletti on 2/17/16.
 */
import { User } from '/model/users'

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
        }
      });
      this.badgeNumber = 1;
      this.isLoggedIn = () => {
        console.log('userid:' + Meteor.userId());
        return Meteor.userId() !== null;
      };

      this.logout = () => {
        console.log("logout");
        Accounts.logout(function(err){
          if(err){
            console.log(err);
          }
          $state.go('login');
        });
      };
    }
  }
});