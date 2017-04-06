import { logger } from '/server/logging'
import { Visits } from '/model/visits'
import { Enrollment } from '/model/enrollment'
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Roles } from 'meteor/alanning:roles'
import { SSR } from 'meteor/meteorhacks:ssr';
import {Errors} from '/server/server-errors';

Meteor.publish("userdata", function () {
  if (this.userId) {
    logger.verbose("publish userdata to " + this.userId);

    let usersInAgencies;
    let agencyIds = Enrollment.find({
      userId:this.userId
    }).map( function (enrollment) { return enrollment.agencyId});
    if (agencyIds) {
      usersInAgencies = Enrollment.find({
        'agencyId': {$in:agencyIds}
      }).map( function (enrollment) {return enrollment.userId});
    }
    else { //if user is not enrolled, get only his own data
      usersInAgencies = [this.userId];
    }

    return User.find(
      {_id: {$in: usersInAgencies}},
      {
        fields: {
          username: 1, emails: 1, roles: 1, fullName: 1, 'createdAt': 1,
          'userData.agencyIds': 1,
          'userData.location': 1, 'userData.locationInfo': 1, 'userData.visitRange': 1,
          'userData.firstName': 1, 'userData.lastName': 1,
          'userData.picture': 1, 'userData.about': 1, 'userData.phoneNumber': 1, 'userData.acceptSMS': 1
        }
      });
  } else {
    this.ready();
  }
});

Meteor.publish("userBasics", function () {
  if (this.userId) {
    logger.verbose("publish userBasics to " + this.userId);
    return [User.find({_id: this.userId},
      {limit: 1, fields: {username: 1, roles: 1, 'userData.agencyIds': 1 }}),
      Enrollment.find({userId: this.userId})];
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

//TODO Currently, not in use. If we use it then we need to rewrite this
// so we do not have observeChanges on every visitor/visit combination
// and we have a stop on each observeChangs
Meteor.publish("topVisitors", function (agency, numberOfDays) {
  var self = this;
  var visitors = User.find({
    'roles': {$elemMatch: {$eq: 'visitor'}},
    'userData.agencyIds': {$elemMatch: {$eq: agency}}
  }, {
    fields: {
      username: 1, primaryEmail: 1, 'userData.firstName': 1, 'userData.lastName': 1, 'userData.picture': 1
    }
  });
  visitors.forEach((user)=> {
    var initializing = true;
    var visits = Visits.find({
      'visitorId': {$eq: user._id},
      'visitTime': {$exists: true, $lt: new Date(), $gt: dateByDaysBefore(numberOfDays)},
      'agencyIds': {$eq: agency}
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

Meteor.publish('visitorUsers', function (agencyId) {
  if (this.userId) {
    logger.verbose("publish visitorUsers to " + this.userId);
    var selector = {};
    selector['roles.' + agencyId] = 'visitor';
    var queryOptions = {
      fields: {
        'createdAt': 1,
        'userData.agencyIds': 1,
        'userData.firstName': 1,
        'userData.lastName': 1,
        'userData.location': 1,
        'userData.about': 1,
        'userData.phoneNumber': 1,
        'roles': 1,
        'emails': 1
      }
    };
    Counts.publish(this, 'numberVisitorUsers', User.find(selector), {
      noReady: true
    });
    let visitors = User.find(selector, queryOptions);
    let handle = visitors.observeChanges({
      added: (id, fields)=> {
        this.added('visitorUsers', id, fields);
      },
      changed: (id, fields)=> {
        this.changed('visitorUsers', id, fields);
      },
      removed: (id)=> {
        this.removed('visitorUsers', id)
      }
    });

    visitors.forEach((user)=> {
      let enrollment = Enrollment.findOne({userId:user._id, agencyId: agencyId });
      user.joinedAgencyOn = enrollment.approvalDate;

      let feedbackRating = Meteor.call('feedbackAvgVisitorRatings', user._id);
      let hoursSinceDate = new Date();
      hoursSinceDate.setFullYear(hoursSinceDate.getFullYear() - 1);
      let feedbackHours = Meteor.call('feedbackTotalHours', user._id, hoursSinceDate);
      user.visitorRating = (feedbackRating[0] && feedbackRating[0].visitorRating) ? feedbackRating[0].visitorRating : '';
      user.visitorHours = (feedbackHours[0] && feedbackHours[0].visitorHours) ? feedbackHours[0].visitorHours / 60 : 0;
      this.added('visitorUsers', user._id, user);
    }, this);
    this.ready();
    // Stop observing the cursor when the client unsubscribes. Stopping a
    // subscription automatically takes care of sending the client any `removed`
    // messages.
    this.onStop (() => {handle.stop()});
  } else {
    this.ready();
  }
});

Meteor.publish("seniorUsers", function (agencyId, options) {
  logger.verbose("publish seniorUsers to " + this.userId);
  if (this.userId) {
    logger.verbose("publish seniorUsers to " + this.userId);
    var selector = {};
    selector['roles.' + agencyId] = 'requester';
    var queryOptions = {
      fields: {
        createdAt: 1,
        'userData.agencyIds': 1,
        'userData.firstName': 1,
        'userData.lastName': 1,
        'userData.location': 1,
        'userData.about': 1,
        'roles': 1,
        'emails': 1
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

Meteor.methods({
  updateName(firstName, lastName)
  {
    Errors.checkUserLoggedIn(this.userId, "updateName", "Must be logged in to update name.");
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
    Errors.checkUserLoggedIn(this.userId, "updateLocation", "Must be logged in to update location.");
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
    Errors.checkUserLoggedIn(this.userId,"updateUserData","Must be logged in to update user data.");
    var currentUser = User.findOne(this.userId);
    currentUser.userData.visitRange = data.visitRange;
    currentUser.userData.about = data.about;
    currentUser.userData.phoneNumber = data.phoneNumber ? data.phoneNumber : null; //remove phone number if there is none
    currentUser.userData.locationInfo = data.locationInfo;
    currentUser.userData.acceptSMS = (data.phoneNumber && data.acceptSMS !== undefined) ? data.acceptSMS : (data.phoneNumber ? true : false); // default to true, unless there is no phone number
    currentUser.save(function (err, id) {
      if (err) {
        logger.error("updateUserData failed to update user. err: " + err);
        throw err;
      }
    });
    logger.info("updateUserData for userId: " + this.userId);
  },
  updateUserEmail(email) {
    Errors.checkUserLoggedIn(this.userId, "updateUserEmail", "Must be logged in to update email.");
    let userId = this.userId;
    var currentUser = Meteor.users.findOne(userId, {emails: 1});
    var currentEmails = currentUser.emails;
    logger.info("currentEmails" + JSON.stringify(currentUser));

    if (email) {
      if (!currentEmails || currentEmails.length == 0) {
        Accounts.addEmail(userId, email);
        Accounts.sendVerificationEmail(userId);
      }
      else {
        let oldEmail = currentUser.emails[0].address;
        if (oldEmail !== email) {
          // NOTE: if the email differs only in case the add email will replace it
          Accounts.addEmail(userId, email);
          currentUser = Meteor.users.findOne({_id: userId}, {emails: 1});
          if (currentUser.emails.length > 1) {
            Accounts.removeEmail(userId, oldEmail);
          }
          Accounts.sendVerificationEmail(userId);
        }
      }
    }
    logger.info("updateUserEmail for userId: " + this.userId + " emails:" + JSON.stringify(currentUser.emails));
  },
  addUserToAgency(userArgs){
    Errors.checkUserLoggedIn(this.userId, 'addUserToAgency', 'Must be logged in to add a user to an agency.');
    Errors.checkUserIsAdministrator(this.userId, userArgs.agencyId, 'addUserToAgency', 'Must be an agency administrator to add users to an agency.');
    let agencyId = userArgs.agencyId;
    let userId = userArgs.userId;
    let agency = Meteor.call('getAgency', agencyId || '');
    if (!agency) {
      logger.error('addUserToAgency - invalid agency');
      throw new Meteor.Error('invalid-agency', 'Agency missing.');
    }
    let user = User.findOne(userId);
    if (!user) {
      logger.error('addUserToAgency - invalid user');
      throw new Meteor.Error('invalid-user', 'User missing.');
    }
    // validate that a role for user can be found
    // If a role argument is included, change the user to have that role in the agency
    let existingRole;
    let groups = Roles.getGroupsForUser(userId);
    groups.forEach(function (group) {
      role = Roles.getRolesForUser(userId, group);
      if (role.length) {
        existingRole = role;
      }
    });
    let role = userArgs.role ? userArgs.role : existingRole;
    if (!role) {
        throw new Meteor.Error('invalid-role', 'User role is missing.');
    }
    let rolesInTheAgency = Roles.getRolesForUser(user, agencyId);
    if (rolesInTheAgency.length ) {
      Roles.removeUsersFromRoles(user, rolesInTheAgency, agencyId);
    }
    Roles.addUsersToRoles(user, role, agencyId);

    let application = Enrollment.findOne( {userId: userId, agencyId: agencyId});
    if (!application) {
      application = new Enrollment({userId: userId, agencyId: agencyId});
    }
    application.approvalDate = new Date();
    application.save(function (err, id) {
      if (err) {
        logger.error("addUserToAgency failed to update enrollment. err: " + err);
        throw err;
      }
    });

    user = User.findOne(userId);

    //TODO: don't need to store agencyId in agencyIds, if we are doing it in role
    if (!user.userData.agencyIds) {
      user.userData.agencyIds = [agencyId]
    } else if (!user.userData.agencyIds.includes(agencyId)) {
      user.userData.agencyIds.push(agencyId);
    }

    user.save((err, id)=> {
      if (err) {
        logger.error('addUserToAgency failed to update user: ' + id + ' err:' + err);
        throw err;
      }
      Meteor.call('sendAgencyWelcomeEmail', userId, agencyId, (error)=> {
        if (error) {
          logger.error(error);
        }
      });
    });
    logger.info('addUserToAgency for user: ' + userId + ' and agency: ' + agencyId);
  },
  createUserFromAdmin(data){
    Errors.checkUserLoggedIn(this.userId, 'createUserFromAdmin', 'Must be logged in to add a user to an agency.');
    //TODO agencyId should be sent as separate argument
    let agencyId = data.userData.agencyIds[0];
    Errors.checkUserIsAdministrator(this.userId, agencyId, 'createUserFromAdmin', 'Must be an agency administrator to add users to an agency.');
    let newUserId;
    try {
      newUserId = Accounts.createUser(data);
      let enrollment = new Enrollment({userId: newUserId, agencyId: agencyId, approvalDate: new Date()} );
      enrollment.save();

      Meteor.call('sendEnrollmentEmail', newUserId, agencyId, (err)=> {
        if (err) {
          logger.error('There was an error sending ' + newUserId + ' enrollment email ' + err);
        }
      });
      Meteor.call('sendAgencyWelcomeEmail', newUserId, agencyId, (err)=> {
        if (err) {
          logger.error('There was an error sending ' + newUserId + ' agency welcome email ' + err);
        }
      })
    } catch (err) {
      if (err.reason === 'Email already exists.') {
        try {
          Meteor.call('addUserToAgency', {
            userId: newUserId || Accounts.findUserByEmail(data.email)._id,
            agencyId: agencyId,
            role: data.role
          });
        } catch (e) {
          if (e.reason !== 'User already belongs to agency.') {
            throw e;
          }
        }
      } else {
        throw err;
      }
    }
    return newUserId || null;
  },
  addProspectiveAgency(agencyId) {
    Errors.checkUserLoggedIn(this.userId, 'addProspectiveAgency', 'Must be logged in to update enrollments.');
    let application = new Enrollment( {userId: this.userId, agencyId: agencyId});
    application.save(function (err, id) {
      if (err) {
        logger.error("addProspectiveAgency failed to update user. err: " + err);
        throw err;
      }
    });
    logger.info("addProspectiveAgency for userId: " + this.userId);
  },
  removeProspectiveAgency(agencyId) {
    Errors.checkUserLoggedIn(this.userId, 'removeProspectiveAgency', 'Must be logged in to update enrollments');
    let application = Enrollment.findOne({userId:this.userId, agencyId:agencyId});
    if (application) {
      application.softRemove()
    }
    logger.info("removeProspectiveAgency for userId: " + this.userId);
  },
  updateRegistrationInfo(userId, data) {
    Errors.checkUserLoggedIn(this.userId, 'updateRegistrationInfo', 'Must be logged in to update user info.');
    var currentUser = User.findOne({_id: userId}, {fields: {username: 1, emails: 1, userData: 1}});
    currentUser.userData = data.userData;
    currentUser.save({fields: ['userData.firstName', 'userData.lastName', 'username', 'emails']}, function (err) {
      if (err) {
        logger.error("updateRegistrationInfo failed to update user. err: " + err);
        throw err;
      }
    });
    if (data.username) {
      // Note: will fail if username is not unique
      Accounts.setUsername(userId, data.username);
    }
    // update email - Note: will fail if another user has the email
    if (data.email) {
      Meteor.call('updateUserEmail', data.email);
    }
    logger.verbose("updateRegistrationInfo for userId: " + this.userId);
  },
  getUserPicture(userId){
    Errors.checkUserLoggedIn(this.userId, 'getUserPicture', 'Must be logged in to view user picture.');
    let user = User.findOne({_id: userId}, {fields: {'userData.picture': 1}});
    return user.userData.picture;
  }
});

Accounts.onCreateUser(function (options, user) {
  if (options.userData) {
    user.userData = options.userData;
  } else {
    user.userData = {firstName: "", lastName: "", visitRange: 1, agencyIds: []};
    user.hasAgency = false;
  }
  let role = options.role ? [options.role] : ['requester'];
  user.roles = {'noagency': role};

  return user;
});

function dateByDaysBefore(daysBefore) {
  var priorDate = new Date() - daysBefore * 24 * 3600 * 1000;
  return new Date(priorDate)
}
