/**
 * Created by Daniel Biales on 1/29/17.
 */
angular.module('visitry.browser').service('UserDetailsDialog', function ($mdDialog) {
  return {
    open: (userId)=> {
      return $mdDialog.show({
        templateUrl: '/packages/visitry-browser/client/users/user-details.html',
        controller: 'userDetailsCtrl as userDetails',
        locals: {
          userId: userId
        },
        clickOutsideToClose:true,
        bindToController:true,
        fullscreen:false
      });
    }
  }
});