import { Agency } from '/model/agencies'
import { Visits } from '/model/visits'

Meteor.publish("userdata", function () {
  if (this.userId) {
    var user = User.findOne({_id: this.userId}, {fields: {'userData.agencyId': 1}});
    return User.find({agencyId: user.userData.agencyId},
      {
        fields: {
          username: 1, emails: 1,
          'userData.location': 1, 'userData.visitRange': 1,
          'userData.firstName': 1, 'userData.lastName': 1,
          'userData.picture': 1, 'userData.about': 1, 'agencyIds': 1
        }
      });
  } else {
    this.ready();
  }
});

Meteor.publish("userProfile", function () {
  if (this.userId) {
    return User.find({_id: this.userId},
      {fields: {username: 1, emails: 1, primaryEmail: 1, 'userData': 1}});
  } else {
    this.ready();
  }
});

Meteor.publish("topVisitors", function (numberOfDays) {
  var self = this;
  var visitors = User.find({'userData.role': {$eq: 'visitor'}}, {
    fields: {
      username: 1, primaryEmail: 1, 'userData.firstName': 1, 'userData.lastName': 1,
      'userData.picture': 1
    }
  });
  visitors.forEach((user)=> {
    var initializing = true;
    var visits = Visits.find({
      'visitorId': {$eq: user._id},
      'visitTime': {$exists: true, $lt: new Date(), $gt: dateByDaysBefore(numberOfDays)}
    }, {fields: {}})
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
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update name.');
    }
    var currentUser = User.findOne(this.userId);
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

    return Accounts.addEmail(Meteor.userId(), email);
  },
  updateLocation(loc) {
    if (!this.userId) {
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
    currentUser.save();
  },
  updateUserData(data) {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update user data.');
    }
    var currentUser = User.findOne(this.userId);
    currentUser.userData.role = data.role;
    currentUser.userData.visitRange = data.visitRange;
    currentUser.userData.about = data.about;
    currentUser.save();
  },
  updatePicture(data) {
    if (!this.userId) {
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update picture.');
    }
    var currentUser = User.findOne(this.userId);
    currentUser.userData.picture = data;
    currentUser.save({fields: ['userData.picture']});
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
    var agency = Agency.findOne({name: 'IVY Agency'});
    if (agency) {
      user.userData.agencyIds = [agency._id];
    }
  }
  return user;
});

function dateByDaysBefore(daysBefore) {
  var priorDate = new Date() - daysBefore * 24 * 3600 * 1000;
  return new Date(priorDate)
}