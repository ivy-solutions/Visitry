/**
 * Created by sarahcoletti on 12/20/16.
 */
angular.module('visitry').service('ChangeMembership', function ($rootScope, $ionicModal) {

  this.showModal = showModal;
  this.hideModal = hideModal;

  function showModal(agency, isMember) {
    this._scope = $rootScope.$new();
    this._scope.agency = agency;

    $ionicModal.fromTemplateUrl(getModalHtml(isMember), {
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

function getModalHtml(isMember) {
  if (Meteor.isCordova) {
    if (isMember) {
      return '/packages/visitrymobile/client/agencies/membership/report-modal.html'
    } else {
      return '/packages/visitrymobile/client/agencies/membership/join-modal.html'
    }
  }
  else {
    if (isMember) {
      return '/packages/vistry-browser/client/agencies/membership/report-modal.html'
    } else {
      return '/packages/vistry-browser/client/agencies/membership/join-modal.html'
    }
  }
}