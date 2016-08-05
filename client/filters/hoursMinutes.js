/**
 * Created by sarahcoletti on 8/5/16.
 */

angular.module('visitry').filter('hoursMinutes', function () {
  return function (numMinutes) {
    if (numMinutes==null) {
      return '0';
    }

    var totalMinutes = parseInt(numMinutes,10);

    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;
    if (hours > 0)
       return hours.toString() + " hr. " + (minutes > 0 ? minutes.toString() + " min." : "");
     else {
       return minutes.toString() + " min."
    }
  }
});