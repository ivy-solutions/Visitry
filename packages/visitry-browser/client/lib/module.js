/**
 * Created by sarahcoletti on 2/17/16.
 */

angular.module('visitry.browser', ['ngMaterial'])
  .config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('green')
      .accentPalette('cyan');
  });