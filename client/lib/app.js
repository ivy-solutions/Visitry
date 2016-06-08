/**
 * Created by sarahcoletti on 2/17/16.
 */
import 'angular'
import angularMeteor from 'angular-meteor'
import ngMaterialIcons from 'angular-material-icons'
let modulesToLoad = [
  angularMeteor,
  'ui.router',
  'accounts.ui',
  'angularUtils.directives.dirPagination',
  'ngMaterial',
  //'ionic-ratings',
  'ionic-timepicker',
  'angularMoment',
  'ngMessages',
  ngMaterialIcons
];

if (Meteor.isCordova) {
  modulesToLoad = modulesToLoad.concat(['visitry.mobile']);
} else {
  modulesToLoad = modulesToLoad.concat(['visitry.browser']);
}

export default angular.module('visitry',modulesToLoad );

function onReady() {
  angular.bootstrap(document, ['visitry'], {
    strictDi: true
  });
}

if (Meteor.isCordova)
  angular.element(document).on("deviceready", onReady);
else
  angular.element(document).ready(onReady);


