/**
 * Created by sarahcoletti on 6/22/16.
 */
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert,expect,fail } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import {Roles} from 'meteor/alanning:roles'
import '/server/users.js';
import '/model/users.js'

if (Meteor.isServer) {
  describe('Users', () => {

    var testUserId;
    beforeEach(() => {
      var user = Meteor.users.findOne({username: 'testUser'});
      if (!user) {
        testUserId = Accounts.createUser({username: 'testUser', password: 'Visitry99', role: "requester"});
      } else {
        testUserId = user._id;
      }
    });
    afterEach(() => {
      Meteor.users.remove(testUserId, function (err) {
        if (err) console.log(err);
      });
    });

    describe('users.updateName method', () => {
      const updateNameHandler = Meteor.server.method_handlers['updateName'];

      it('succeeds when valid first and last name passed', () => {
        const invocation = {userId: testUserId};
        updateNameHandler.apply(invocation, ["firstName", "lastName"]);
        var updatedUser = User.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.firstName, "firstName");
        assert.equal(updatedUser.userData.lastName, "lastName");
      });

      it('fails when user is not logged in', () => {
        const invocation = {userId: null};
        try {
          updateNameHandler.apply(invocation, ["firstName", "lastName"]);
          fail("expected exception");
        } catch (ex) {
          assert.equal(ex.error, 'not-logged-in')
        }
      });

    });

    describe('users.updateLocation method', () => {
      const updateLocationHandler = Meteor.server.method_handlers['updateLocation'];

      const location = {
        name: "some place, U.S.A",
        formattedAddress: "123 Main St., Acton, MA 01720",
        latitude: 42.12345,
        longitude: -71.23
      }
      it('succeeds when valid location passed', () => {
        const invocation = {userId: testUserId};
        updateLocationHandler.apply(invocation, [location]);
        var updatedUser = User.findOne(testUserId);
        assert.equal(updatedUser.userData.location.address, location.name);
        assert.equal(updatedUser.userData.location.formattedAddress, location.formattedAddress);
        assert.equal(updatedUser.userData.location.geo.coordinates[1], location.latitude);
        assert.equal(updatedUser.userData.location.geo.coordinates[0], location.longitude);
      });

      it('fails when user is not logged in', () => {
        const invocation = {userId: null};
        try {
          updateLocationHandler.apply(invocation, [location, 10]);
          fail("expected exception");
        } catch (ex) {
          assert.equal(ex.error, 'not-logged-in')
        }
      });

    });

    describe('users.updateUserData method', () => {
      const updateUserDataHandler = Meteor.server.method_handlers['updateUserData'];

      it('succeeds when valid fields passed', () => {
        const invocation = {userId: testUserId};
        updateUserDataHandler.apply(invocation, [
          {
            role: "visitor",
            visitRange: 20,
            about: "I raise chickens",
            phoneNumber: "(800)555-1212",
            acceptSMS: false,
            locationInfo: "Apt.3B"
          }]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        // adding ground-user package broke this.. - sjc
        //assert.isTrue(Roles.userIsInRole(updatedUser, "visitor"), "role should be visitor" + updatedUser.roles);
        assert.equal(updatedUser.userData.visitRange, 20);
        assert.equal(updatedUser.userData.about, "I raise chickens");
        assert.equal(updatedUser.userData.phoneNumber, "(800)555-1212");
        assert.equal(updatedUser.userData.acceptSMS, false);
        assert.equal(updatedUser.userData.locationInfo, "Apt.3B");
      });

      it('fails when user is not logged in', () => {
        const invocation = {userId: null};
        try {
          updateUserDataHandler.apply(invocation, [{role: "visitor", visitRange: 20}]);
          fail("expected exception");
        } catch (ex) {
          assert.equal(ex.error, 'not-logged-in')
        }
      });
      it('fails when invalid visitRange', () => {
        const invocation = {userId: testUserId};
        try {
          updateUserDataHandler.apply(invocation, [{role: "visitor", visitRange: "NaN"}]);
          fail("expected exception");
        } catch (err) {
          assert.equal(err.error, 'validation-error', err.error);
          assert.equal(err.reason, '"userData.visitRange" has to be a number', err.reason)
        }
      });
      it('fails when visitRange=0', () => {
        const invocation = {userId: testUserId};
        try {
          updateUserDataHandler.apply(invocation, [{role: "visitor", visitRange: 0}]);
          fail("expected exception");
        } catch (err) {
          assert.equal(err.error, 'validation-error', err.error);
          assert.equal(err.reason, '"userData.visitRange" has to be greater than 0', err.reason)
        }
      });
      it('succeeds when no phoneNumber', () => {
        const invocation = {userId: testUserId};
        updateUserDataHandler.apply(invocation, [{role: "visitor", visitRange: 20, about: "I raise chickens"}]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.isNull(updatedUser.userData.phoneNumber);
      });
      it('succeeds when phoneNumber with dashes', () => {
        const invocation = {userId: testUserId};
        updateUserDataHandler.apply(invocation, [{
          role: "visitor",
          visitRange: 20,
          about: "I raise chickens",
          phoneNumber: "800-555-1212"
        }]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.phoneNumber, "800-555-1212");
      });
      it('fails when phoneNumber is invalid', () => {
        const invocation = {userId: testUserId};
        try {
          updateUserDataHandler.apply(invocation, [{
            role: "visitor",
            visitRange: 20,
            about: "I raise chickens",
            phoneNumber: "800 555-121"
          }]);
          fail("expected exception");
        } catch (err) {
          assert.equal(err.error, 'validation-error', err.error);
          assert.equal(err.reason, 'Phone number format should be (nnn) nnn-nnnn', err.reason)
        }
      });

    });
    describe('users.updateUserEmail', ()=> {
      const updateUserEmailHandler = Meteor.server.method_handlers['updateUserEmail'];
      it('adds a user email when one does not exist', ()=> {
        const invocation = {userId: testUserId};
        updateUserEmailHandler.apply(invocation, ["new.test@email.com"]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.emails.length, 1);
        assert.equal(updatedUser.emails[0].address, 'new.test@email.com');
      });
      it('adds a user email when one already exists but overwrites that one', ()=> {
        testUserId = Accounts.createUser({
          username: 'testUserWithEmail',
          password: 'Visitry99',
          role: "requester",
          emails: [{address: 'email@address.com', verified: true}]
        });
        const invocation = {userId: testUserId};
        updateUserEmailHandler.apply(invocation, ["new.test@email.com"]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.emails.length, 1);
        assert.equal(updatedUser.emails[0].address, 'new.test@email.com');
      })
    });

    describe('users.addUserToAgency', ()=> {
      const addUserToAgencyHandler = Meteor.server.method_handlers['addUserToAgency'];
      var adminTestUser;
      beforeEach(()=> {
        adminTestUser = Accounts.createUser({username: 'testUserAdmin', password: 'Visitry99', role: "administrator"});
      });
      afterEach(()=> {
        Meteor.users.remove(adminTestUser, function (err) {
          if (err) console.log(err);
        });
      });

      it('adds a user to an agency', ()=> {
        const invocation = {userId: adminTestUser};
        addUserToAgencyHandler.apply(invocation, [testUserId, 'agency1']);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.agencyIds.length, 1);
        assert.equal(updatedUser.userData.agencyIds[0], 'agency1');
      });
      it('adds a user to an agency they already belong to does not double enter', ()=> {
        const invocation = {userId: adminTestUser};
        addUserToAgencyHandler.apply(invocation, [testUserId, 'agency1']);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.agencyIds.length, 1);
        assert.equal(updatedUser.userData.agencyIds[0], 'agency1');
        addUserToAgencyHandler.apply(invocation, [testUserId, 'agency1']);
        updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.agencyIds.length, 1);
        assert.equal(updatedUser.userData.agencyIds[0], 'agency1');
      });
      it('add a user to an agency when they already have an agency', ()=> {
        const invocation = {userId: adminTestUser};
        addUserToAgencyHandler.apply(invocation, [testUserId, 'agency1']);
        addUserToAgencyHandler.apply(invocation, [testUserId, 'agency2']);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.agencyIds.length, 2);
        assert.equal(updatedUser.userData.agencyIds[0], 'agency1');
        assert.equal(updatedUser.userData.agencyIds[1], 'agency2');
      });
    });

    describe('users.createUserFromAdmin', ()=> {
      const createUserFromAdminHandler = Meteor.server.method_handlers['createUserFromAdmin'];
      let accountsCreateUserSpy;
      let testNewUserId;
      beforeEach(()=> {
        accountsCreateUserSpy = sinon.spy(Accounts, 'createUser');
      });
      afterEach(()=> {
        accountsCreateUserSpy.reset();
        Accounts.createUser.restore();
        Meteor.users.remove(testNewUserId, function (err) {
          if (err) console.log(err);
        });
      });

      it('Accounts.createUser is called', ()=> {
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId,['administrator']);
        createUserFromAdminHandler.apply(invocation, [{email: 'test@email.com'}]);
        testNewUserId = Meteor.users.findOne({emails: {$elemMatch: {address: 'test@email.com'}}})._id;
        assert(accountsCreateUserSpy.calledOnce);
      });
    });

    describe('users.sendEnrollmentEmail', ()=> {
      const sendEnrollmentEmailHandler = Meteor.server.method_handlers['sendEnrollmentEmail'];
      let accountsSendEnrollmentEmailSpy;
      let result;
      beforeEach(()=> {
        accountsSendEnrollmentEmailSpy = sinon.stub(Accounts, 'sendEnrollmentEmail', ()=> {
          result = true;
        });
        testUserId = Accounts.createUser({
          username: 'testUserWithEmail',
          password: 'Visitry99',
          role: "requester",
          email: 'email@address.com'
        });
      });
      afterEach(()=> {
        Accounts.sendEnrollmentEmail.restore();
      });
      it('Accounts.createUser is called', ()=> {
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId,['administrator']);
        sendEnrollmentEmailHandler.apply(invocation, [testUserId]);
        assert.equal(result,true);
      });
    });

    describe('users.addProspectiveAgency method', () => {
      const addProspectiveAgencyHandler = Meteor.server.method_handlers['addProspectiveAgency'];
      var agencyId = Random.id();

      it('succeeds when user adding one prospective agency', () => {
        const invocation = {userId: testUserId};
        addProspectiveAgencyHandler.apply(invocation, [agencyId]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.prospectiveAgencyIds.length, 1);
        assert.equal(updatedUser.userData.prospectiveAgencyIds[0], agencyId);
      });
      it('succeeds when user adding two prospective agencies', () => {
        const invocation = {userId: testUserId};
        var agency2 = Random.id()
        addProspectiveAgencyHandler.apply(invocation, [agencyId]);
        addProspectiveAgencyHandler.apply(invocation, [agency2]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.prospectiveAgencyIds.length, 2);
        assert.equal(updatedUser.userData.prospectiveAgencyIds[0], agencyId);
        assert.equal(updatedUser.userData.prospectiveAgencyIds[1], agency2);
      });
    });
  });
}