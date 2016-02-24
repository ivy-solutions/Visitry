angular.module('visitry').controller('requestVisitModalCtrl',function($scope,$reactive,RequestVisit){
  $reactive(this).attach($scope);

  this.submit = function(){
    hideRequestVisitModal();
  };
  this.cancel = function(){
    hideRequestVisitModal();
  };

  function hideRequestVisitModal(){
    RequestVisit.hideModal();
  }
});
