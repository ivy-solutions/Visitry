angular.module('visitry').service('RequestVisit', function ($rootScope, $ionicModal) {

  this.showModal = showModal;
  this.hideModal = hideModal;

  function showModal() {
    this._scope = $rootScope.$new();

    $ionicModal.fromTemplateUrl(getModalHtml(), {
      scope: this._scope
    }).then((modal) => {
      this._modal = modal;
      modal.show();
    });
  }

  function hideModal() {
    this._modal.remove();
    this._scope.$destroy();
  }
});

function getModalHtml() {
  if (Meteor.isCordova) {
    return '/packages/visitrymobile/client/visits/request-visit/request-visit-modal.html'
  }
  else {
    return '/packages/vistry-browser/client/visits/request-visit/request-visit-modal.html'
  }
}