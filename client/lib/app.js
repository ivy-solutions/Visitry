/**
 * Created by sarahcoletti on 2/17/16.
 */
import 'angular'
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import ngMaterialIcons from 'angular-material-icons';
import ngMessages from 'angular-messages';
import ngMoment from 'angular-moment';
import ngCookies from 'angular-cookies'

let modulesToLoad = [
  angularMeteor,
  uiRouter,
  'accounts.ui',
  'angularUtils.directives.dirPagination',
  'ionic',
  ngMoment,
  ngMessages,
  ngMaterialIcons,
  ngCookies
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


