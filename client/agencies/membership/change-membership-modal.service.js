/**
 * Created by sarahcoletti on 12/20/16.
 */
angular.module('visitry').service('ChangeMembership', function ($rootScope, $ionicModal) {

  this.showModal = showModal;
  this.hideModal = hideModal;

  function showModal(agency, isPendingMember) {
    this._scope = $rootScope.$new();
    this._scope.agency = agency;

    $ionicModal.fromTemplateUrl(getModalHtml(isPendingMember), {
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

function getModalHtml(isPendingMember) {
  if (Meteor.isCordova) {
    if (isPendingMember) {
      return '/packages/visitrymobile/client/agencies/membership/revoke-modal.html'
    } else {
      return '/packages/visitrymobile/client/agencies/membership/join-modal.html'
    }
  }
  else {
    if (isPendingMember) {
      return '/packages/vistry-browser/client/agencies/membership/revoke-modal.html'
    } else {
      return '/packages/vistry-browser/client/agencies/membership/join-modal.html'
    }
  }
}