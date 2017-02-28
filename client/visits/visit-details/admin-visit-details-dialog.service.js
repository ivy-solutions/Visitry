/**
 * Created by Daniel Biales on 2/10/17.
 */
angular.module('visitry.browser').service('AdminVisitDetailsDialog', function ($mdDialog) {
  return {
    open: (visitId)=> {
      return $mdDialog.show({
        templateUrl: '/packages/visitry-browser/client/admin-console/manage/visit-details.html',
        controller: 'adminVisitDetailsCtrl as adminVisitDetails',
        locals: {
          visitId: visitId
        },
        clickOutsideToClose:true,
        bindToController:true,
        fullscreen:false
      });
    }
  }
});