/**
 * Created by sarahcoletti on 2/17/16.
 */
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
    controller: function( $scope, $reactive ) {
      $reactive(this).attach($scope);
/*      this.subscribe('user');

      this.helpers({
        userRole: ()=> {
          var role = User.findOne({_id:Meteor.userId()},{fields: {'userData.role':1}});
          return role;
        }
      });*/

      //this.badgeNumber =1;
      this.isLoggedIn = () => {
        console.log('userid:' + Meteor.userId());
        return Meteor.userId() !== null;
      };

      this.logout = () => {
        console.log( "logout")
        Accounts.logout();
      };
    }
  }
});