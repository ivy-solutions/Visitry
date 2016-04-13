/**
 * Created by sarahcoletti on 2/17/16.
 */
let modulesToLoad = [
  'angular-meteor',
  'ui.router',
  'accounts.ui',
  'angularUtils.directives.dirPagination',
  'ngMaterial',
  'ionic-ratings',
  'ionic-timepicker',
  'ion-profile-picture',
  'angularMoment',
  'ngMessages'
];

if (Meteor.isCordova) {
  modulesToLoad = modulesToLoad.concat(['visitry.mobile']);
} else {
  modulesToLoad = modulesToLoad.concat(['visitry.browser']);
}

angular.module('visitry',modulesToLoad );

function onReady() {
  angular.bootstrap(document, ['visitry'], {
    strictDi: true
  });
}

if (Meteor.isCordova)
  angular.element(document).on("deviceready", onReady);
else
  angular.element(document).ready(onReady);


