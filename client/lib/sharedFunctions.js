/**
 * Created by n0235626 on 3/22/16.
 */
Meteor.myFunctions = {
  dateSortArray: function(arr){
    var dateSortedVisits = [];
    arr.forEach(function (visit) {
      if (dateSortedVisits.length && (new Date(+dateSortedVisits[dateSortedVisits.length - 1].date)).toDateString() === (new Date(+visit.requestedDate)).toDateString()) {
        dateSortedVisits[dateSortedVisits.length - 1].visits.push(visit);
      }
      else {
        dateSortedVisits.push({"date": visit.requestedDate, "visits": [visit]})
      }
    });
    return dateSortedVisits;
  },

  //FIXME: This function seems like it shouldn't be used anymore since we are storing things with requesterId
  getRequester: function (visit) {
    if (!visit)
      return 'No such visit';
    var requester;
    if ( visit.requesterId ) {
      requester = Meteor.users.findOne({_id: visit.requesterId});
    }
    if (!requester)
      return 'No such user for ' + visit.requesterId;

    return requester;
  }
};