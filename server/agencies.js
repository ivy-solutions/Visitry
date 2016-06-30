/**
 * Created by sarahcoletti on 6/30/16.
 */
Meteor.publish("allAgencies", function (options) {
  var today = new Date();
  today.setHours(0,0,0,0);
  // active agencies
  return Agencies.find({
    activeUntil: { $gt : today}
  },options);
});

Meteor.publish("userAgency", function (options) {
  if ( this.userId ) {
    var user = Meteor.users.findOne( {_id: this.userId() }, {fields: {'userData.agencyId': 1}});
    return Agencies.find({
      _id: { $gt : user.agencyId }
    },options);
  } else {
    this.ready();
  }
});
