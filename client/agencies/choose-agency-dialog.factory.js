/**
 * Created by sarahcoletti on 3/13/17.
 */
angular.module('visitry.browser').service('ChooseAgencyDialog', function ($mdDialog) {
  return {
    open: (closeDialog)=> {
      return $mdDialog.show({
        templateUrl: '/packages/visitry-browser/client/admin-console/manage/choose-agency.html',
        controller: 'chooseAgencyCtrl as chooseAgency',
        clickOutsideToClose:true,
        escapeToClose: true,
        bindToController:true,
        fullscreen:false
      }).then( closeDialog, closeDialog);
    }
  }
});