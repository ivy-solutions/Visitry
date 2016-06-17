Meteor.publish("userdata", function () {
  if (this.userId) {
    //TODO will have a filter on affiliation with agencies of the current user eventually
    return Meteor.users.find({},
      {fields: {username: 1, emails: 1,
        'userData.location.name': 1, 'userData.location.longitude': 1,'userData.location.latitude': 1,
        'userData.firstName':1, 'userData.lastName':1,
        'userData.picture': 1, 'userData.interests': 1}});
  } else {
    this.ready();
  }
});

Meteor.methods({
  updateName(firstName, lastName, role)
  {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update name.');
    }

    check(firstName, String);
    check(lastName, String);
    check(role, String);

    return Meteor.users.update(this.userId, {$set: {'userData.firstName': firstName, 'userData.lastName': lastName, 'userData.role': role}});
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
      details: loc.details,
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
    user.userData = {firstname: "", lastName: "", role:"visitor"}
  }
  return user;
});
