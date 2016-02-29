/**
 * Created by sarahcoletti on 2/28/16.
 */
angular.module('visitry').filter('weekdayDate', function () {
  return function (input) {
    if (!input) {
      return input;
    }
    var _date = new Date(parseInt(input));
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var dayOfWeek = days[_date.getDay()];
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var month = months[_date.getMonth()];
    return dayOfWeek + ", " + month + " " + _date.getDate();
  }
});