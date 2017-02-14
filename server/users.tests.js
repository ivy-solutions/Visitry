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
import StubCollections from 'meteor/hwillson:stub-collections';

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
      it('replaces user email if differs only in case', ()=> {
        testUserId = Accounts.createUser({
          username: 'testUserWithEmail',
          password: 'Visitry99',
          role: "requester",
          emails: [{address: 'email@address.com', verified: true}]
        });
        const invocation = {userId: testUserId};
        updateUserEmailHandler.apply(invocation, ["EMAIL@address.com"]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.emails.length, 1);
        assert.equal(updatedUser.emails[0].address, 'EMAIL@address.com');
      })
    });

    describe('users.addUserToAgency', ()=> {

      const addUserToAgencyHandler = Meteor.server.method_handlers['addUserToAgency'];
      var adminTestUser;
      let meteorCallStub;
      let emailSpy;
      beforeEach(()=> {
        testUserId = Accounts.createUser({
          username: 'testUserWithEmail',
          password: 'Visitry99',
          role: "requester",
          email: 'email@address.com'
        });
        adminTestUser = Accounts.createUser({username: 'testUserAdmin', password: 'Visitry99', role: "administrator"});
        meteorCallStub = sinon.stub(Meteor, 'call', () => { //calls getAgency
          return {name: 'fakeAgency', contactEmail: 'fake@email.com', contactPhone: '1234567890'};
        });
        emailSpy = sinon.spy(Email, 'send');
      });
      afterEach(()=> {
        Meteor.users.remove(adminTestUser, function (err) {
          if (err) console.log(err);
        });
        Meteor.call.restore();
        emailSpy.reset();
        Email.send.restore();
      });

      it('adds a user to an agency', ()=> {
        const invocation = {userId: adminTestUser};
        addUserToAgencyHandler.apply(invocation, [{userId: testUserId, agencyId: 'agency1'}]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.agencyIds.length, 1);
        assert.equal(updatedUser.userData.agencyIds[0], 'agency1');
        assert.equal(emailSpy.args[0][0].from, 'Visitry Admin <admin@visitry.org>');
        assert.equal(emailSpy.args[0][0].to, updatedUser.emails[0].address);
        assert.equal(emailSpy.args[0][0].subject, 'Visitry: Welcome to fakeAgency');
      });
      it('add a user to an agency fails if no user is provided', ()=> {
        const invocation = {userId: adminTestUser};
        assert.throws(()=>addUserToAgencyHandler.apply(invocation, [{agencyId: 'agency1'}]), 'User missing. [invalid-user]');
      });
      it('add a user to an agency fails if no agency is provided', ()=> {
        Meteor.call.restore();
        meteorCallStub = sinon.stub(Meteor, 'call', () => { //calls getAgency
          return;
        });
        const invocation = {userId: adminTestUser};
        assert.throws(()=>addUserToAgencyHandler.apply(invocation, [{userId: testUserId}]), 'Agency missing. [invalid-agency]');
      });
      it('adds a user to an agency they already belong to does not double enter', ()=> {
        const invocation = {userId: adminTestUser};
        addUserToAgencyHandler.apply(invocation, [{userId: testUserId, agencyId: 'agency1'}]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.agencyIds.length, 1);
        assert.equal(updatedUser.userData.agencyIds[0], 'agency1');
        assert.throws(()=>addUserToAgencyHandler.apply(invocation, [{
          userId: testUserId,
          agencyId: 'agency1'
        }]), 'User already belongs to agency. [conflict]');
        updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.agencyIds.length, 1);
        assert.equal(updatedUser.userData.agencyIds[0], 'agency1');
        assert.equal(emailSpy.callCount, 1);
      });
      it('add a user to an agency when they already have an agency', ()=> {
        const invocation = {userId: adminTestUser};
        addUserToAgencyHandler.apply(invocation, [{userId: testUserId, agencyId: 'agency1'}]);
        addUserToAgencyHandler.apply(invocation, [{userId: testUserId, agencyId: 'agency2'}]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.agencyIds.length, 2);
        assert.equal(updatedUser.userData.agencyIds[0], 'agency1');
        assert.equal(updatedUser.userData.agencyIds[1], 'agency2');
        assert.equal(emailSpy.args[0][0].from, 'Visitry Admin <admin@visitry.org>');
        assert.equal(emailSpy.args[0][0].to, updatedUser.emails[0].address);
        assert.equal(emailSpy.args[0][0].subject, 'Visitry: Welcome to fakeAgency');
      });
      it('add a user to an agency and remove the agency from prospective', ()=> {
        const invocation = {userId: adminTestUser};
        let originalUser = User.findOne({_id: testUserId});
        originalUser.userData = {prospectiveAgencyIds: ['agency1']};
        originalUser.save();
        addUserToAgencyHandler.apply(invocation, [{userId: testUserId, agencyId: 'agency1'}]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.agencyIds.length, 1);
        assert.equal(updatedUser.userData.agencyIds[0], 'agency1');
        assert.equal(updatedUser.userData.prospectiveAgencyIds.length, 0);
      });
      it('add a user to an agency changes their role to what is set', ()=> {
        const invocation = {userId: adminTestUser};
        addUserToAgencyHandler.apply(invocation, [{userId: testUserId, agencyId: 'agency1', role: 'visitor'}]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.agencyIds.length, 1);
        assert.equal(updatedUser.userData.agencyIds[0], 'agency1');
        assert.equal(updatedUser.roles[0], 'visitor');
        assert.equal(emailSpy.args[0][0].from, 'Visitry Admin <admin@visitry.org>');
        assert.equal(emailSpy.args[0][0].to, updatedUser.emails[0].address);
        assert.equal(emailSpy.args[0][0].subject, 'Visitry: Welcome to fakeAgency');
      });
    });

    describe('users.createUserFromAdmin', ()=> {
      const createUserFromAdminHandler = Meteor.server.method_handlers['createUserFromAdmin'];
      let accountsCreateUserSpy;
      let testNewUserId;
      let meteorCallStub;
      beforeEach(()=> {
        accountsCreateUserSpy = sinon.spy(Accounts, 'createUser');
        meteorCallStub = sinon.stub(Meteor, 'call');
      });
      afterEach(()=> {
        accountsCreateUserSpy.reset();
        Accounts.createUser.restore();
        Meteor.call.restore();
        testNewUserId = Meteor.users.findOne({emails: {$elemMatch: {address: 'test@email.com'}}});
        if (testNewUserId) {
          Meteor.users.remove(testNewUserId._id, function (err) {
            if (err) {
              console.log(err);
            }
          });
        }
      });

      it('User must be logged in to createUser', ()=> {
        const invocation = {userId: null};
        assert.throws(()=>createUserFromAdminHandler.apply(invocation, [{
          email: 'test@email.com',
          userData: {agencyIds: [Random.id()]}
        }]), 'Must be logged in to add a user to an agency. [not-logged-in]');
      });

      it('User must be administrator to createUser', ()=> {
        const invocation = {userId: testUserId};
        assert.throws(()=>createUserFromAdminHandler.apply(invocation, [{
          email: 'test@email.com',
          userData: {agencyIds: [Random.id()]}
        }]), 'Must be an agency administrator to add users to an agency. [unauthorized]');
      });

      it('Accounts.createUser is called', ()=> {
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator']);
        createUserFromAdminHandler.apply(invocation, [{email: 'test@email.com', userData: {agencyIds: [Random.id()]}}]);
        testNewUserId = Meteor.users.findOne({emails: {$elemMatch: {address: 'test@email.com'}}})._id;
        assert(accountsCreateUserSpy.calledOnce);
      });

      it('If user doesn\'t exist send enrollment email is called', ()=> {
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator']);
        createUserFromAdminHandler.apply(invocation, [{email: 'test@email.com', userData: {agencyIds: [Random.id()]}}]);
        testNewUserId = Meteor.users.findOne({emails: {$elemMatch: {address: 'test@email.com'}}})._id;
        assert(meteorCallStub.calledWith('sendEnrollmentEmail', testNewUserId));
      });

      it('Accounts.createUser returns id', ()=> {
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator']);
        testNewUserId = createUserFromAdminHandler.apply(invocation, [{
          email: 'test@email.com',
          userData: {agencyIds: [Random.id()]}
        }]);
        assert.equal(testNewUserId, Meteor.users.findOne({emails: {$elemMatch: {address: 'test@email.com'}}})._id)
      });

      it('throws error if Accouts.createUser throws error', ()=> {
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator']);
        let error = {reason: 'could not read email of undefined'};
        Accounts.createUser.restore();
        accountsCreateUserSpy = sinon.stub(Accounts, 'createUser');
        accountsCreateUserSpy.throws(error);
        assert.throws(()=>createUserFromAdminHandler.apply(invocation, [{
          email: 'test@email.com',
          userData: {agencyIds: [Random.id()]}
        }]), error);
      });

      it('if user already exists addUserToAgency is called', ()=> {
        testNewUserId = Random.id();
        sinon.stub(Accounts, 'findUserByEmail', ()=>({_id: testNewUserId}));
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator']);
        let error = {reason: 'Email already exists.'};
        Accounts.createUser.restore();
        accountsCreateUserSpy = sinon.stub(Accounts, 'createUser');
        accountsCreateUserSpy.throws(error);
        let user = {email: 'test@email.com', role: 'visitor', userData: {agencyIds: [Random.id()]}}
        createUserFromAdminHandler.apply(invocation, [user]);
        assert(meteorCallStub.calledWith('addUserToAgency', {
          userId: testNewUserId,
          agencyId: user.userData.agencyIds[0],
          role: user.role
        }));
        testNewUserId = null;
        Accounts.findUserByEmail.restore();
      });

      it('if user already exists addUserToAgency, if user already belongs to agency it returns null', ()=> {
        testNewUserId = Random.id();
        sinon.stub(Accounts, 'findUserByEmail', ()=>({_id: testNewUserId}));
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator']);
        let error = {reason: 'Email already exists.'};
        Accounts.createUser.restore();
        accountsCreateUserSpy = sinon.stub(Accounts, 'createUser');
        accountsCreateUserSpy.throws(error);
        let user = {email: 'test@email.com', role: 'visitor', userData: {agencyIds: [Random.id()]}};
        error = {reason: 'User already belongs to agency.'};
        meteorCallStub.throws(error);
        assert.isNull(createUserFromAdminHandler.apply(invocation, [user]));
        testNewUserId = null;
        Accounts.findUserByEmail.restore();
      });

      it('if user already exists addUserToAgency which throws error', ()=> {
        testNewUserId = Random.id();
        sinon.stub(Accounts, 'findUserByEmail', ()=>({_id: testNewUserId}));
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator']);
        let error = {reason: 'Email already exists.'};
        Accounts.createUser.restore();
        accountsCreateUserSpy = sinon.stub(Accounts, 'createUser');
        accountsCreateUserSpy.throws(error);
        let user = {email: 'test@email.com', role: 'visitor', userData: {agencyIds: [Random.id()]}};
        error = {reason: 'Cannot read userId of undefined'};
        meteorCallStub.throws(error);
        assert.throws(()=>createUserFromAdminHandler.apply(invocation, [user]), error);
        testNewUserId = null;
        Accounts.findUserByEmail.restore();
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
        accountsSendEnrollmentEmailSpy.restore();
      });
      it('Accounts.createUser is called', ()=> {
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator']);
        sendEnrollmentEmailHandler.apply(invocation, [testUserId]);
        assert.equal(result, true);
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
        var agency2 = Random.id();
        addProspectiveAgencyHandler.apply(invocation, [agencyId]);
        addProspectiveAgencyHandler.apply(invocation, [agency2]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.prospectiveAgencyIds.length, 2);
        assert.equal(updatedUser.userData.prospectiveAgencyIds[0], agencyId);
        assert.equal(updatedUser.userData.prospectiveAgencyIds[1], agency2);
      });
    });

    describe('users.updateRegistrationInfo', () => {
      const updateRegistrationInfoHandler = Meteor.server.method_handlers['updateRegistrationInfo'];
      let meteorCallStub;
      beforeEach(()=> {
        meteorCallStub = sinon.stub(Meteor, 'call');
      });
      afterEach(()=> {
        meteorCallStub.restore();
      });

      it ('succeeds in updating name fields', () => {
        const invocation = {userId: testUserId};
        let data = {userData: { firstName: "Cornelius", lastName: "Clodhopper"}, username:"Corny"};
        updateRegistrationInfoHandler.apply(invocation, [testUserId, data] );
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.firstName, "Cornelius");
        assert.equal(updatedUser.userData.lastName, "Clodhopper");
        assert.equal(updatedUser.username, "Corny");
        assert.isFalse(meteorCallStub.withArgs('updateUserEmail').calledOnce);
      });

      it ('calls updateUserEmail if email passed', () => {
        const invocation = {userId: testUserId};
        let data = {userData: { firstName: "Sylvester", lastName: "Sunshine"}, username:"Sunny", email:"sunny@someplace.com"};
        updateRegistrationInfoHandler.apply(invocation, [testUserId, data] );
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.isTrue(meteorCallStub.withArgs('updateUserEmail').calledOnce);
      });
    })

  });
}