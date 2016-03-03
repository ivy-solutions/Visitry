Meteor.publish("users", function () {
  return Meteor.users.find({}, {fields: {username: 1, emails: 1, profile: 1}});
});