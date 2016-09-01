/**
 * Created by n0235626 on 3/22/16.
 */
Meteor.myFunctions = {
  //expects arr to be sorted by requested dates
  groupVisitsByRequestedDate: function (sortedVisits) {
    var dateGroupedVisits = [];
    sortedVisits.forEach(function (visit) {
      if (dateGroupedVisits.length && (new Date(+dateGroupedVisits[dateGroupedVisits.length - 1].date)).toDateString() === (new Date(+visit.requestedDate)).toDateString()) {
        dateGroupedVisits[dateGroupedVisits.length - 1].visits.push(visit);
      }
      else {
        dateGroupedVisits.push({"date": visit.requestedDate, "visits": [visit]})
      }
    });
    return dateGroupedVisits;
  },
  getUser: function (userId) {
    if (userId) {
      return User.findOne({_id: userId});
    } else {
      return null;
    }
  },
  getUserImage: function (userId) {
    var user = this.getUser(userId);
    if (user && user.userData && user.userData.picture)
      return user.userData.picture;
    else
      return "";
  }
};