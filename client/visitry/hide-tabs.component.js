/**
 * Created by sarahcoletti on 9/21/16.
 */
angular.module('visitry').directive('hideTabs', function($rootScope, $ionicTabsDelegate) {
  return {
    restrict: 'A',
    link: function($scope, $el) {
      $scope.$on("$ionicView.enter", function () {
        $ionicTabsDelegate.$getByHandle('visitorTabs').showBar(false);
        $ionicTabsDelegate.$getByHandle('requesterTabs').showBar(false)
      });
      $scope.$on("$ionicView.beforeLeave", function () {
        var isVisitor = Meteor.myFunctions.isVisitor();
        if ( isVisitor)
          $ionicTabsDelegate.$getByHandle('visitorTabs').showBar(true);
        else
          $ionicTabsDelegate.$getByHandle('requesterTabs').showBar(Meteor.userId()!=null)
      });
    }
  };
});