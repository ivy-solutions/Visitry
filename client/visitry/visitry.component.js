/**
 * Created by sarahcoletti on 2/17/16.
 */
angular.module('visitry').directive('visitry', function () {
  return {
    restrict: 'E',
    templateUrl: () => {
      if (Meteor.isCordova) {
        return '/packages/visitry-mobile/client/visitry/visitry.html';
      } else {
        return '/packages/visitry-browser/client/visitry/visitry.html';
      }
    },
    controllerAs: 'visitry',
    controller: function( $scope, $reactive ) {
 //     $reactive(this).attach($scope);

      $scope.isLoggedIn = () => {
        console.log('userid:' + Meteor.userId());
        return Meteor.userId() !== null;
      };

      $scope.currentUser = () => {
        console.log( "current User" + Meteor.userId());
        return Meteor.user();
      };

      $scope.logout = () => {
        console.log( "logout")
        Accounts.logout();
      };
    }
  }
});