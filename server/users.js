Meteor.publish("users", function () {
  return Meteor.users.find({}, {fields: {username: 1, emails: 1, profile: 1}});
});
Meteor.publish("users-names", function({userIds}) {
  new SimpleSchema({
    userIds: {type: [String]}
  }).validate({userIds});

  //select only users with those ids
  const selector = {
    _id: {$in:userIds}
  };
  //return the name fields
  //TODO best practices advise against using profile field
  const options = {
    fields: { username: 1, profile: 1}
  };
  return Meteor.users.find({selector, options} )
});


Meteor.methods({
  updateName(firstName, lastName)
  {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update name.');
    }

    check(firstName, String);
    check(lastName, String);

    return Meteor.users.update(this.userId, {$set: {'profile.firstName': firstName, 'profile.lastName': lastName}});
  },
  updateEmail(email)
  {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update email.');
    }

    check(email, String);

    console.log( "email:" + email)
    if (email && Meteor.user().emails) {
      Accounts.removeEmail(Meteor.userId, Meteor.user().emails[0].addresss);
    }
    return Accounts.addEmail(Meteor.userId(), email );
  }

});
