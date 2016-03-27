/**
 * Created by sarahcoletti on 3/26/16.
 */
angular.module('visitry').filter('dayMonthDateAtHourMinute', function () {
  return function (datetime) {
    if (!datetime) {
      return 'No Time Specified';
    }
    var formattedDate = moment(datetime).format("dddd, MMM. Do");
    var formattedTime = moment(datetime).format("h:mm");
    return formattedDate + " at " + formattedTime;
  }
});