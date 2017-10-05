/**
 * Created by sarahcoletti on 3/13/16.
 */
angular.module('visitry').filter('timeOfDay', function () {
  return function (datetime) {
    if (!datetime) {
      return 'No Time Specified';
    }

    // 9am = morning, 1pm = afternoon, 4pm = evening
    var time = moment(datetime);
    var hours = time.hour();
    var minutes = time.minute();
    var exactTime = time.format(' (h:mma)');
    var answer;
    if (hours < 12) {
      answer = 'Morning';
      if ( hours != 9 || minutes != 0 )
        answer += exactTime;
    }
    else if (hours < 16) {
      answer = 'Afternoon';
      if (hours != 13 || minutes != 0)
        answer += exactTime;
    }
    else if (hours <= 23) {
      answer = 'Evening';
      if (hours != 16 || minutes != 0)
        answer += exactTime;
    }
    else {
      return 'Any time';
    }
    return answer;
  }
});