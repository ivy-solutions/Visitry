import { Agency } from '/model/agencies'
import { User } from '/model/users'

Meteor.publish("userdata", function () {
  if (this.userId) {
    var user = User.findOne({_id: this.userId},{fields: {'userData.agencyId': 1}});
    return User.find({agencyId: user.userData.agencyId },
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
    return User.find({_id:this.userId},
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
    var currentUser = User.findOne( this.userId );
    currentUser.userData.firstName = firstName;
    currentUser.userData.lastName = lastName;
    currentUser.userData.role = role;

    currentUser.save();
  },
  //TODO not used
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

    var currentUser = User.findOne( this.userId );
    currentUser.userData.location = {
      address: loc.name,
      geo: { 
        type: "Point",
        coordinates: [loc.longitude, loc.latitude]
      }
    };
    currentUser.save();
  },
  updateUserData(data) {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update user data.');
    }
    var currentUser = User.findOne( this.userId );
    currentUser.userData.role = data.role;
    currentUser.userData.vicinity = data.vicinity;
    currentUser.save();
  },
  updatePicture(data) {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update picture.');
    }
    var currentUser = User.findOne( this.userId );
    currentUser.userData.picture = data;
    currentUser.save({fields: ['userData.picture'] });
  }
});

Accounts.onCreateUser(function(options, user) {
  if ( options.userData)
    user.userData = options.userData;
  else {
    user.userData = {firstName: "", lastName: "", role:"visitor" }
  }
  //TODO include real agency in input
  if (!user.userData.agencyId) {  // use default, if no agency selected
    var agency = Agency.findOne({name:'IVY Agency'});
    if ( agency ) {
      user.userData.agencyIds = [agency._id];
    }
  }
  return user;
});
