Meteor.publish("users", function () {
  return Meteor.users.find({}, {fields: {username: 1, emails: 1, profile: 1}});
});

Meteor.methods({
  updateFirstName(name)
  {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update name.');
    }

    //check(name, String);

    return Meteor.users.update(this.userId, {$set: {'profile.firstName': name}});
  },
  updateLastName(name)
  {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update name.');
    }

    //check(name, String);

    return Meteor.users.update(this.userId, {$set: {'profile.lastName': name}});
  }

});
