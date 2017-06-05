/**
 * Created by sarahcoletti on 6/1/17.
 */
import {logger} from '/client/logging'

angular.module('visitry').controller('adminBrowseToDashboardCtrl', function ($scope, $state, $reactive) {
  $reactive(this).attach($scope);

  this.browseToWebsite = function(){
    var page = Meteor.absoluteUrl();
    if (page) {
      window.open(page, '_system');
    }
  };

  // v1 ionic does not detect android tablets
  this.isTablet = ionic.Platform.isIPad();

});