import { Agency } from '/model/agencies'
import { logger } from '/server/logging'
import { Visits } from '/model/visits'

Meteor.publish("userdata", function () {
  if (this.userId) {
    logger.verbose("publish userdata to " + this.userId );
    var user = User.findOne({_id: this.userId},{fields: {'userData.agencyId': 1}});
    return User.find({agencyId: user.userData.agencyId },
      {fields: {username: 1, emails: 1,
        'userData.location': 1, 'userData.visitRange': 1,
        'userData.firstName':1, 'userData.lastName':1,
        'userData.picture': 1, 'userData.about': 1, 'userData.phoneNumber': 1}});
  } else {
    this.ready();
  }
});

Meteor.publish("userProfile", function () {
  if (this.userId) {
    logger.verbose("publish userProfile to " + this.userId );
    return User.find({_id:this.userId},
      {fields: {username: 1, 'userData': 1}});
  } else {
    this.ready();
  }
});

Meteor.publish("topVisitors", function (agency, numberOfDays) {
  var self = this;
  var visitors = User.find({'userData.role': {$eq: 'visitor'}, 'userData.agencyIds': {$elemMatch: {$eq: agency}}}, {
    fields: {
      username: 1, primaryEmail: 1, 'userData.firstName': 1, 'userData.lastName': 1,
      'userData.picture': 1
    }
  });
  visitors.forEach((user)=> {
    var initializing = true;
    var visits = Visits.find({
      'visitorId': {$eq: user._id},
      'visitTime': {$exists: true, $lt: new Date(), $gt: dateByDaysBefore(numberOfDays)},
      'agencyId': {$eq: agency}
    }, {fields: {}});
    user.visitCount = visits.count();
    self.added('topVisitors', user._id, user);
    visits.observeChanges({
      added: function (user) {
        user.visitCount++;
        if (!initializing)
          self.changed('topVisitors', user._id, user);
      },
      removed: function (user) {
        user.visitCount--;
        self.changed('topVisitors', user._id, user);
      }
    });
  }, self);
  self.ready();
});

Meteor.methods({
  updateName(firstName, lastName, role)
  {
    if (!this.userId) {
      logger.error( "updateName - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update name.');
    }
    var currentUser = User.findOne(this.userId);
    currentUser.userData.firstName = firstName;
    currentUser.userData.lastName = lastName;
    currentUser.userData.role = role;

    currentUser.save(function(err, id) {
      if (err) {
        logger.error("updateName failed to update user. err: " + err);
        throw err;
      }
    });
    logger.info("updateName for userId: " + this.userId );
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

    var currentUser = User.findOne(this.userId);
    if (loc) {
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
    currentUser.save(function(err, id) {
      if (err) {
        logger.error("updateLocation failed to update user. err: " + err);
        throw err;
      }
    });
    logger.info("updateLocation for userId: " + this.userId );
  },
  updateUserData(data) {
    if (!this.userId) {
      logger.error( "updateUserData - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update user data.');
    }
    var currentUser = User.findOne(this.userId);
    currentUser.userData.role = data.role;
    currentUser.userData.visitRange = data.visitRange;
    currentUser.userData.about = data.about;
    currentUser.userData.phoneNumber = data.phoneNumber ? data.phoneNumber: null; //remove phone number of there is none
    currentUser.save(function(err, id) {
      if (err) {
        logger.error("updateUserData failed to update user. err: " + err);
        throw err;
      }
    });
    logger.info("updateUserData for userId: " + this.userId );
  },
  updatePicture(data) {
    if (!this.userId) {
      logger.error( "updatePicture - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update picture.');
    }
    var currentUser = User.findOne(this.userId);
    currentUser.userData.picture = data;
    currentUser.save({fields: ['userData.picture'] },function(err, id) {
      if (err) {
        logger.error("updatePicture failed to update user. err: " + err);
        throw err;
      }
    });
    logger.info("updatePicture for userId: " + this.userId );
  }
});

Accounts.onCreateUser(function (options, user) {
  if (options.userData)
    user.userData = options.userData;
  else {
    user.userData = {firstName: "", lastName: "", role: "visitor"}
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

function dateByDaysBefore(daysBefore) {
  var priorDate = new Date() - daysBefore * 24 * 3600 * 1000;
  return new Date(priorDate)
}