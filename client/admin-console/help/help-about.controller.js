/**
 * Created by n0235626 on 8/31/16.
 */
import pjson from '/package.json'

angular.module('visitry.browser').controller('adminHelpAboutCtrl', function ($scope, $state, $reactive) {
  $reactive(this).attach($scope);
  this.developers = "Ivy Solutions";
  this.version = pjson.version;
  this.description = 'Visitry app provides convenient scheduling of volunteer visits. Users can sign up with participating volunteer visiting programs to request visits or visit others. Visitry makes communication between the participants and between participants and program administrators easy. Simple feedback is collected from participants after each visit so that the program may be continually improved.'
});