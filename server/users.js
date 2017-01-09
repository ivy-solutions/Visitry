import { Agency } from '/model/agencies'
import { logger } from '/server/logging'
import { Visits } from '/model/visits'
import { Counts } from 'meteor/tmeasday:publish-counts';
import {Roles} from 'meteor/alanning:roles'

Meteor.publish("userdata", function () {
  if (this.userId) {
    logger.verbose("publish userdata to " + this.userId);
    var user = User.findOne({_id: this.userId}, {fields: {'userData.agencyId': 1}});
    return User.find({agencyId: user.userData.agencyId},
      {
        fields: {
          username: 1, emails: 1, roles: 1,
          'userData.agencyIds': 1,
          'userData.location': 1, 'userData.visitRange': 1,
          'userData.firstName': 1, 'userData.lastName': 1,
          'userData.picture': 1, 'userData.about': 1, 'userData.phoneNumber': 1, 'userData.acceptSMS': 1,
          'userData.prospectiveAgencyIds':1
        }
      });
  } else {
    this.ready();
  }
});

Meteor.publish("userBasics", function () {
  if (this.userId) {
    logger.verbose("publish userBasics to " + this.userId);
    return User.find({_id: this.userId},
      { limit:1, fields: {username: 1, roles: 1, 'userData.agencyIds': 1, 'userData.prospectiveAgencyIds': 1}});
  } else {
    this.ready();
  }
});

Meteor.publish("userProfile", function () {
  if (this.userId) {
    logger.verbose("publish userProfile to " + this.userId);
    return User.find({_id: this.userId},
      {limit: 1, fields: {username: 1, emails: 1, roles: 1, userData: 1}});
  } else {
    this.ready();
  }
});

Meteor.publish("topVisitors", function (agency, numberOfDays) {
  var self = this;
  var visitors = User.find({
    'roles': {$elemMatch: {$eq: 'visitor'}},
    'userData.agencyIds': {$elemMatch: {$eq: agency}}
  }, {
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

Meteor.publish("seniorUsers", function (agencyId, options) {
  if (this.userId) {
    logger.verbose("publish seniorUsers to " + this.userId);
    var selector = {
      'userData.agencyIds': {$elemMatch: {$eq: agencyId}},
      'roles': {$elemMatch: {$eq: 'requester'}}
    };
    var queryOptions = {
      fields: {
        createdAt: 1,
        'userData.agencyIds': 1,
        'userData.firstName': 1,
        'userData.lastName': 1,
        'userData.location.address': 1,
        'roles': 1
      }
    };
    Counts.publish(this, 'numberSeniorUsers', User.find(selector), {
      noReady: true
    });
    return User.find(selector, queryOptions);
  } else {
    this.ready();
  }
});

Meteor.publish("visitorUsers", function (agencyId, options) {
  if (this.userId) {
    logger.verbose("publish visitorUsers to " + this.userId);
    var selector = {
      'userData.agencyIds': {$elemMatch: {$eq: agencyId}},
      'roles': {$elemMatch: {$eq: 'visitor'}}
    };
    var queryOptions = {
      fields: {
        createdAt: 1,
        'userData.agencyIds': 1,
        'userData.firstName': 1,
        'userData.lastName': 1,
        'userData.location.address': 1,
        'roles': 1
      }
    };
    Counts.publish(this, 'numberVisitorUsers', User.find(selector), {
      noReady: true
    });
    return User.find(selector, queryOptions);
  } else {
    this.ready();
  }
});


Meteor.methods({
  updateName(firstName, lastName)
  {
    if (!this.userId) {
      logger.error("updateName - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update name.');
    }
    var currentUser = User.findOne(this.userId);
    currentUser.userData.firstName = firstName;
    currentUser.userData.lastName = lastName;

    currentUser.save(function (err, id) {
      if (err) {
        logger.error("updateName failed to update user. err: " + err);
        throw err;
      }
    });
    logger.info("updateName for userId: " + this.userId);
  },
  updateLocation(loc) {
    if (!this.userId) {
      logger.error("updateLocation - user not logged in");
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
    currentUser.save(function (err, id) {
      if (err) {
        logger.error("updateLocation failed to update user. err: " + err);
        throw err;
      }
    });
    logger.info("updateLocation for userId: " + this.userId);
  },
  updateUserData(data) {
    if (!this.userId) {
      logger.error("updateUserData - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update user data.');
    }

    var currentUser = User.findOne(this.userId);
    currentUser.userData.visitRange = data.visitRange;
    currentUser.userData.about = data.about;
    currentUser.userData.phoneNumber = data.phoneNumber ? data.phoneNumber : null; //remove phone number if there is none
    currentUser.userData.locationInfo = data.locationInfo;
    currentUser.userData.acceptSMS = (data.phoneNumber && data.acceptSMS !== undefined) ? data.acceptSMS : (data.phoneNumber ? true : false); // default to true, unless there is no phone number
    Roles.addUsersToRoles(currentUser, [data.role]);
    currentUser.save(function (err, id) {
      if (err) {
        logger.error("updateUserData failed to update user. err: " + err);
        throw err;
      }
    });
    logger.info("updateUserData for userId: " + this.userId);
  },
  updateUserEmail(email) {
    if (!this.userId) {
      logger.error("updateUserEmail - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update user email.');
    }
    var currentUser = Meteor.users.findOne(this.userId, {emails: 1});
    var currentEmails = currentUser.emails;
    logger.info("currentEmails" + JSON.stringify(currentUser));
    if (currentEmails != null) {
      logger.info("removeEmail for userId: " + this.userId);
      Accounts.removeEmail(currentUser._id, currentUser.emails[0].address)
    }
    if (email) {
      logger.info("addEmail for userId: " + this.userId + " email:" + email);
      Accounts.addEmail(currentUser._id, email);
      //Accounts.sendVerificationEmail(currentUser._id);
    }
    logger.info("updateUserEmail for userId: " + this.userId + " emails:" + JSON.stringify(currentUser.emails));
  },
  addUserToAgency(userId, agencyId){
    if (!this.userId) {
      logger.error("addUserToAgency - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to add a user to an agency.');
    }
    if (!Roles.userIsInRole(this.userId, ['administrator'])) {
      logger.error('addUserToAgency - unauthorized');
      throw new Meteor.Error('unauthorized', 'Must be an agency administrator to add users to an agency.');
    }
    var user = User.findOne(userId);
    if (!user.userData.agencyIds.includes(agencyId)) {
      user.userData.agencyIds.push(agencyId);
      user.save((err, id)=> {
        if (err) {
          logger.error('addUserToAgency failed to update user: ' + id + ' err:' + err);
          throw err;
        }
      });
      logger.info('addUserToAgency for user: ' + userId + ' and agency: ' + agencyId);
    }
  },
  createUserFromAdmin(data, callback){
    if (!this.userId) {
      logger.error("addUserToAgency - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to add a user to an agency.');
    }
    if (!Roles.userIsInRole(this.userId, ['administrator'])) {
      logger.error('addUserToAgency - unauthorized');
      throw new Meteor.Error('unauthorized', 'Must be an agency administrator to add users to an agency.');
    }
    Accounts.createUser(data, callback);
  },
  sendEnrollmentEmail(userId){
    if (!this.userId) {
      logger.error("addUserToAgency - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to add a user to an agency.');
    }
    if (!Roles.userIsInRole(this.userId, ['administrator'])) {
      logger.error('addUserToAgency - unauthorized');
      throw new Meteor.Error('unauthorized', 'Must be an agency administrator to add users to an agency.');
    }
    Accounts.sendEnrollmentEmail(userId);
  },
  addProspectiveAgency(agencyId) {
    if (!this.userId) {
      logger.error("addProspectiveAgency - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update agencies.');
    }
    var currentUser = User.findOne(this.userId);
    var currentProspectiveAgencies = currentUser.userData.prospectiveAgencyIds;
    if ( !currentProspectiveAgencies) {
      currentUser.userData.prospectiveAgencyIds = [agencyId];
    } else {
      if (!currentUser.userData.prospectiveAgencyIds.includes(agencyId)) {
        currentUser.userData.prospectiveAgencyIds.push(agencyId);
      }
    }
    currentUser.save(function (err, id) {
      if (err) {
        logger.error("addProspectiveAgency failed to update user. err: " + err);
        throw err;
      }
    });
    logger.info("addProspectiveAgency for userId: " + this.userId);
  }
});

Accounts.onCreateUser(function (options, user) {
  if (options.userData) {
    user.userData = options.userData;
  } else {
    user.userData = {firstName: "", lastName: "", visitRange: 1}
  }
  //TODO include real agency in input
  if (!user.userData.agencyId) {  // use default, if no agency selected
    logger.error("user has no agency. userId: " + user._id);
    var agency = Agency.findOne({name: 'IVY Agency'});
    if (agency) {
      user.userData.agencyIds = [agency._id];
    }else{
      user.userData.agencyIds = [];
    }
  }
  user.roles = options.role ? [options.role] : ['requester'];

  logger.info("onCreateUser for userId: " + user._id + " roles: " + user.roles);
  return user;
});

function dateByDaysBefore(daysBefore) {
  var priorDate = new Date() - daysBefore * 24 * 3600 * 1000;
  return new Date(priorDate)
}