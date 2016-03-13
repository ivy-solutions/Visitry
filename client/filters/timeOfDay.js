/**
 * Created by sarahcoletti on 3/13/16.
 */
angular.module('visitry').filter('timeOfDay', function () {
  return function (datetime) {
    if (!datetime) {
      return 'No Time Specified';
    }

    // 9am = morning, 1pm = afternoon, 4pm = evening
    var hours = new Date(datetime).getHours();
    if (hours == 9)
      return  'Morning';
    if (hours == 13)
      return 'Afternoon';
    if (hours == 16)
      return 'Evening';
    else
      return 'Any time';
  }
});