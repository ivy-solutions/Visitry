/**
 * Created by n0235626 on 3/22/16.
 */
Meteor.myFunctions = {
  dateSortArray: function(arr){
    var dateSortedVisits = [];
    arr.forEach(function (visit) {

      if (dateSortedVisits.length && (new Date(+dateSortedVisits[dateSortedVisits.length - 1].date)).getDate() === (new Date(+visit.requestedDate)).getDate()) {
        dateSortedVisits[dateSortedVisits.length - 1].visits.push(visit);
      }
      else {
        dateSortedVisits.push({"date": visit.requestedDate, "visits": [visit]})
      }
    });
    return dateSortedVisits;
  },

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