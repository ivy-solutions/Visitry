/**
 * Created by sarahcoletti on 2/17/16.
 */
import ngCookies from 'angular-cookies'

angular.module('visitry.browser', ['ngMaterial',ngCookies])
  .config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('green')
      .accentPalette('cyan');
  });