angular.module('visitry').service('RequestVisit', function ($rootScope, $ionicModal) {

  this.showModal = showModal;
  this.hideModal = hideModal;

  function showModal(visitId) {
    this._scope = $rootScope.$new();
    this._scope.fromVisitId = visitId;

    $ionicModal.fromTemplateUrl(getModalHtml(visitId), {
      scope: this._scope
    }).then((modal) => {
      this._modal = modal;
      modal.show(visitId);
    });
  }

  function hideModal() {
    this._modal.remove();
    this._scope.$destroy();
  }
});

function getModalHtml(visitId) {
  if (Meteor.isCordova) {
    if (visitId) {
      return '/packages/visitrymobile/client/visits/request-visit/request-another-visit-modal.html'
    } else {
      return '/packages/visitrymobile/client/visits/request-visit/request-visit-modal.html'
    }
  }
  else {
    return '/packages/vistry-browser/client/visits/request-visit/request-visit-modal.html'
  }
}