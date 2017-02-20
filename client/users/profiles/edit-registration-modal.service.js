/**
 * Created by sarahcoletti on 2/13/17.
 */
angular.module('visitry').service('EditRegistration', function ($rootScope, $ionicModal) {

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
    return '/packages/visitrymobile/client/users/edit-registration-modal.html'
  }
  else {
    return '/packages/vistry-browser/client/users/edit-registration-modal.html'
  }
}