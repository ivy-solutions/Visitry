Meteor.publish("userdata", function () {
  if (this.userId) {
    var user = Meteor.users.findOne({_id: this.userId},{fields: {'userData.agencyId': 1}});
    return Meteor.users.find({agencyId: user.userData.agencyId },
      {fields: {username: 1, emails: 1,
        'userData.location': 1, 'userData.vicinity': 1,
        'userData.firstName':1, 'userData.lastName':1,
        'userData.picture': 1, 'userData.interests': 1}});
  } else {
    this.ready();
  }
});

Meteor.publish("userProfile", function () {
  if (this.userId) {
    return Meteor.users.find({_id:this.userId},
      {fields: {username: 1, emails: 1, primaryEmail: 1, 'userData': 1}});
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
    check(email, String);

    if (email && Meteor.user().emails) {
      Accounts.removeEmail(Meteor.userId, Meteor.user().emails[0].addresss);
    }

    return Accounts.addEmail(Meteor.userId(), email );
  },
  updateLocation(loc) {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update location.');
    }

    check(loc.name, String);
    check(loc.latitude, Number);
    check(loc.longitude, Number);
    //valid longitude and latitude
    if ( loc.longitude < -180 || loc.longitude > 180 || loc.latitude < -90 | loc.latitude > 90 ) {
      throw new Meteor.Error('invalid-location', "Location coordinates are invalid.")
    }

    var location = {
      name: loc.name,
      geo: { type : "Point",
        coordinates: [loc.longitude,loc.latitude] }
    };

    return Meteor.users.update(this.userId, {$set: {'userData.location': location}} );

    },
  updateUserData(data) {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update user data.');
    }

    check(data.role, String);
    check(data.vicinity, String);

    return Meteor.users.update(this.userId, {$set: {'userData.role': data.role, 'userData.vicinity': data.vicinity}} );
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
    user.userData = {firstName: "", lastName: "", role:"visitor", vicinity: "10"}
  }
  //TODO include agency in input
  if (!user.userData.agencyId) {  // use default, if no agency selected
    var agency = Agencies.findOne({name:'IVY Agency'});
    user.userData.agencyId = agency._id;
  }
  return user;
});
