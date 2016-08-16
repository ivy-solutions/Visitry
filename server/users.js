import { Agency } from '/model/agencies'
import { User } from '/model/users'
import { logger } from '/server/logging'

Meteor.publish("userdata", function () {
  logger.info("publish userdata to " + this.userId );
  if (this.userId) {
    var user = User.findOne({_id: this.userId},{fields: {'userData.agencyId': 1}});
    return User.find({agencyId: user.userData.agencyId },
      {fields: {username: 1, emails: 1,
        'userData.location': 1, 'userData.visitRange': 1,
        'userData.firstName':1, 'userData.lastName':1,
        'userData.picture': 1, 'userData.about': 1}});
  } else {
    this.ready();
  }
});

Meteor.publish("userProfile", function () {
  logger.info("publish userProfile to " + this.userId );
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
      logger.error( "updateName - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update name.');
    }
    var currentUser = User.findOne( this.userId );
    currentUser.userData.firstName = firstName;
    currentUser.userData.lastName = lastName;
    currentUser.userData.role = role;

    logger.info("updateName for userId: " + this.userId );
    currentUser.save();
  },
  //TODO not used
  updateEmail(email)
  {
    if (!this.userId) {
      logger.error( "updateEmail - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update email.');
    }
    logger.info("updateEmail for userId: " + this.userId );

    if (email && Meteor.user().emails) {
      Accounts.removeEmail(this.userId, Meteor.user().emails[0].addresss);
    }

    return Accounts.addEmail(this.userId, email );
  },
  updateLocation(loc) {
    if (!this.userId) {
      logger.error( "updateLocation - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update location.');
    }

    var currentUser = User.findOne( this.userId );
    if ( loc ) {
      currentUser.userData.location = {
        address: loc.name,
        formattedAddress: loc.formattedAddress,
        geo: {
          type: "Point",
          coordinates: [loc.longitude, loc.latitude]
        }
      };
    } else {  //removing location
      currentUser.userData.location = null;
    }
    logger.info("updateLocation for userId: " + this.userId );
    currentUser.save();
  },
  updateUserData(data) {
    if (!this.userId) {
      logger.error( "updateUserData - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update user data.');
    }
    var currentUser = User.findOne( this.userId );
    currentUser.userData.role = data.role;
    currentUser.userData.visitRange = data.visitRange;
    currentUser.userData.about = data.about;
    logger.info("updateUserData for userId: " + this.userId );
    currentUser.save();
  },
  updatePicture(data) {
    if (!this.userId) {
      logger.error( "updatePicture - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update picture.');
    }
    var currentUser = User.findOne( this.userId );
    currentUser.userData.picture = data;
    logger.info("updatePicture for userId: " + this.userId );
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
    logger.error( "user has no agency. userId: " + user._id);
    var agency = Agency.findOne({name:'IVY Agency'});
    if ( agency ) {
      user.userData.agencyIds = [agency._id];
    }
  }
  logger.info("onCreateUser for userId: " + user._id );
  return user;
});
