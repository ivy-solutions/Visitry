/**
 * Created by sarahcoletti on 9/19/16.
 */
angular.module('visitry').service('ScheduleVisit', function ($rootScope, $ionicModal) {

  this.showModal = showModal;
  this.hideModal = hideModal;

  function showModal(visit) {
    this._scope = $rootScope.$new();
    this._scope.visit = visit;

    $ionicModal.fromTemplateUrl(getModalHtml(), {
      scope: this._scope
    }).then((modal) => {
      this._modal = modal;
      modal.show();
    });
  }

  function hideModal() {
    this._scope.$destroy();
    this._modal.remove();
  }
});

function getModalHtml() {
  if (Meteor.isCordova) {
    return '/packages/visitrymobile/client/visits/schedule-visit/schedule-visit-modal.html'
  }
  else {
    return '/packages/vistry-browser/client/visits/schedule-visit/schedule-visit-modal.html'
  }
}