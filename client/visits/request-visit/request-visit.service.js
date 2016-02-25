angular.module('visitry').service('RequestVisit', function ($rootScope, $ionicModal) {
  let templateUrl = 'client/templates/new-chat.html';

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
    this._scope.$destroy();
    this._modal.remove();
  }
});

function getModalHtml() {
  if (Meteor.isCordova) {
    return '/packages/visitry-mobile/client/visits/request-visit/request-visit-modal.html'
  }
  else {
    return '/packages/vistry-browser/client/visits/request-visit/request-visit-modal.html'
  }
}