Meteor.publish("users", function () {
  //TODO will have a filter on affiliation with agencies of the current user eventually
  return Meteor.users.find({}, {fields: {username: 1, emails: 1, userData:1}});
});


Meteor.publish("users-data", function({userIds}) {
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
    fields: { username: 1, location: 1, vicinity:1}
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

    return Meteor.users.update(this.userId, {$set: {'userData.firstName': firstName, 'userData.lastName': lastName}});
  },
  updateEmail(email)
  {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update email.');
    }

    if (email && Meteor.user().emails) {
      Accounts.removeEmail(Meteor.userId, Meteor.user().emails[0].addresss);
    }
    check(email, String);

    return Accounts.addEmail(Meteor.userId(), email );
  },
  updateLocation(loc, vicinity) {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update location.');
    }

    var location = {
      name: loc.name,
      latitude: loc.latitude,
      longitude: loc.longitude
    };

    return Meteor.users.update(this.userId, {$set: {'userData.location': location, 'userData.vicinity': vicinity}} );

    },
  updatePicture(data) {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update picture.');
    }

 //   check(data, String);

    return Meteor.users.update(this.userId, { $set: { 'userData.picture': data } });
  }
});

Accounts.onCreateUser(function(options, user) {
  if ( options.userData)
    user.userData = options.userData;
  else {
    user.userData = {firstname: "No", lastName: "Name"}
  }
  return user;
});
