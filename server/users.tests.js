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
import {Errors} from '/server/server-errors';
import {Enrollments,Enrollment} from '/model/enrollment'
import {Visits} from '/model/visits'
import StubPackage from 'meteor/hwillson:stub-collections';
const StubCollections = StubPackage.default

if (Meteor.isServer) {
  describe('Users', () => {

    let testUserId;
    beforeEach(() => {
      //TODO: convert this to use StubCollections -- there is an issue with astronomy save method so it won't work currently
      let user = Meteor.users.findOne({username: 'testUser'});
      if (!user) {
        testUserId = Accounts.createUser({username: 'testUser', password: 'Visitry99', role: "requester"});
      } else {
        testUserId = user._id;
      }
    });
    afterEach(() => {
      Meteor.users.remove(testUserId);
    });

    describe('users.updateName method', () => {
      const updateNameHandler = Meteor.server.method_handlers['updateName'];

      it('succeeds when valid first and last name passed', () => {
        const invocation = {userId: testUserId};
        updateNameHandler.apply(invocation, ["firstName", "lastName"]);
        let updatedUser = User.findOne({_id: testUserId});
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
        let updatedUser = User.findOne(testUserId);
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
      var testUserWithEmailId;
      beforeEach(() => {
        testUserWithEmailId = Accounts.createUser({
          username: 'testUserWithEmail',
          password: 'Visitry99',
          role: "requester",
          emails: [{address: 'email@address.com', verified: true}]
        });
      });
      afterEach(() => {
        Meteor.users.remove(testUserWithEmailId);
      });

      it('adds a user email when one does not exist', ()=> {
        const invocation = {userId: testUserId};
        updateUserEmailHandler.apply(invocation, ["new.test@email.com"]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.emails.length, 1);
        assert.equal(updatedUser.emails[0].address, 'new.test@email.com');
      });
      it('adds a user email when one already exists but overwrites that one', ()=> {
        const invocation = {userId: testUserWithEmailId};
        updateUserEmailHandler.apply(invocation, ["new.test@email.com"]);
        var updatedUser = Meteor.users.findOne({_id: testUserWithEmailId});
        assert.equal(updatedUser.emails.length, 1);
        assert.equal(updatedUser.emails[0].address, 'new.test@email.com');
      });
      it('replaces user email if differs only in case', ()=> {
        const invocation = {userId: testUserWithEmailId};
        updateUserEmailHandler.apply(invocation, ["EMAIL@address.com"]);
        var updatedUser = Meteor.users.findOne({_id: testUserWithEmailId});
        assert.equal(updatedUser.emails.length, 1);
        assert.equal(updatedUser.emails[0].address, 'EMAIL@address.com');
      })
    });
    describe('users.removeUserFromAgency',()=>{
      const removeUserFromAgencyHandler = Meteor.server.method_handlers['removeUserFromAgency'];
      let agencyId = Random.id();
      let adminTestUser;
      let meteorCallStub;
      let errorsStub;
      beforeEach(()=> {
        testUserId = Accounts.createUser({
          username: 'testUserWithEmail',
          password: 'Visitry99',
          email: 'email@address.com'
        });
        Roles.addUsersToRoles(testUserId, 'requester', agencyId);
        StubCollections.stub(Enrollments)
        Enrollments.insert({userId: testUserId, agencyId: agencyId})
        StubCollections.stub(Visits)
        adminTestUser = Accounts.createUser({username: 'testUserAdmin', password: 'Visitry99'});
        Roles.addUsersToRoles(adminTestUser, 'administrator', agencyId);
        errorsStub = sinon.stub(Errors, 'checkUserIsAdministrator').returns(true);
        meteorCallStub = sinon.stub(Meteor, 'call');
        meteorCallStub.withArgs('getAgency').returns({
          name: 'fakeAgency',
          contactEmail: 'fake@email.com',
          contactPhone: '1234567890'
        });
      });
      afterEach(()=> {
        Meteor.users.remove(adminTestUser);
        StubCollections.restore()
        meteorCallStub.restore();
        errorsStub.restore();
      });

      it('remove a user removes their role', ()=> {
        const invocation = {userId: adminTestUser};
        removeUserFromAgencyHandler.apply(invocation, [{userId: testUserId,role:'requester', agencyId: agencyId }]);
        assert.notDeepEqual(Roles.getRolesForUser(testUserId, agencyId),["requester"], "does not have requester role for agency");
      });
      it('remove a user updates user document', ()=> {
        const invocation = {userId: adminTestUser};
        removeUserFromAgencyHandler.apply(invocation, [{userId: testUserId,role:'requester', agencyId: agencyId }]);
        let updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.agencyIds.length, 0);
      });
      it('remove a user from an agency fails if no user is provided', ()=> {
        const invocation = {userId: adminTestUser};
        assert.throws(()=>removeUserFromAgencyHandler.apply(invocation, [{agencyId: agencyId}]), 'User missing. [invalid-user]');
      });
      it('remove a user from an agency fails if no agency is provided', ()=> {
        meteorCallStub.withArgs('getAgency').returns('');
        const invocation = {userId: adminTestUser};
        assert.throws(()=>removeUserFromAgencyHandler.apply(invocation, [{userId: testUserId}]), 'Agency missing. [invalid-agency]');
      });
      it('remove a user from an agency fails if the user has a visit request outstanding',()=>{
        Visits.insert({
          requestedDate:getTomorrowDate(),
          requesterId:testUserId,
          agencyId:agencyId,
          location:{
            address: 'here',
            formattedAddress: 'here',
            geo: {type:'Point',coordinates:[1,2]}
          }
        })
        const invocation = {userId: adminTestUser};
        assert.throws(()=>removeUserFromAgencyHandler.apply(invocation, [{userId: testUserId,role:'requester', agencyId: agencyId }]), 'Cannot remove the user, due to outstanding visits. [user-has-visits]');
      })
      it('remove a user from an agency fails if the user has a visit scheduled',()=>{
        Visits.insert({
          requestedDate:getYesterdayDate(),
          requesterId:Random.id(),
          visitorId:testUserId,
          agencyId:agencyId,
          visitTime:getTomorrowDate(),
          location:{
            address: 'here',
            formattedAddress: 'here',
            geo: {type:'Point',coordinates:[1,2]}
          }
        })
        const invocation = {userId: adminTestUser};
        assert.throws(()=>removeUserFromAgencyHandler.apply(invocation, [{userId: testUserId,role:'requester', agencyId: agencyId }]), 'Cannot remove the user, due to outstanding visits. [user-has-visits]');
      })
      it('remove a user from an agency does not fail if the user has a past visit',()=>{
        Visits.insert({
          requestedDate:getYesterdayDate(),
          requesterId:testUserId,
          visitorId:Random.id(),
          agencyId:agencyId,
          visitTime:getYesterdayDate(),
          location:{
            address: 'here',
            formattedAddress: 'here',
            geo: {type:'Point',coordinates:[1,2]}
          }
        })
        const invocation = {userId: adminTestUser};
        assert.doesNotThrow(()=>removeUserFromAgencyHandler.apply(invocation, [{userId: testUserId,role:'requester', agencyId: agencyId }]), 'Cannot remove the user, due to outstanding visits. [user-has-visits]');
      })
    })
    describe('users.addUserToAgency', ()=> {

      const addUserToAgencyHandler = Meteor.server.method_handlers['addUserToAgency'];
      let agencyId = Random.id();
      let adminTestUser;
      let meteorCallStub;
      let errorsStub;
      beforeEach(()=> {
        testUserId = Accounts.createUser({
          username: 'testUserWithEmail',
          password: 'Visitry99',
          email: 'email@address.com'
        });
        Roles.addUsersToRoles(testUserId, 'requester', 'noagency');
        adminTestUser = Accounts.createUser({username: 'testUserAdmin', password: 'Visitry99'});
        Roles.addUsersToRoles(adminTestUser, 'administrator', agencyId);
        errorsStub = sinon.stub(Errors, 'checkUserIsAdministrator').returns(true);
        meteorCallStub = sinon.stub(Meteor, 'call');
        meteorCallStub.withArgs('getAgency').returns({
          name: 'fakeAgency',
          contactEmail: 'fake@email.com',
          contactPhone: '1234567890'
        });
      });
      afterEach(()=> {
        Meteor.users.remove(adminTestUser);
        meteorCallStub.restore();
        errorsStub.restore();
      });

      it('adds a user to an agency sets role', ()=> {
        const invocation = {userId: adminTestUser};
        addUserToAgencyHandler.apply(invocation, [{userId: testUserId, agencyId: agencyId, role:'requester'}]);
        assert.deepEqual(Roles.getRolesForUser(testUserId, agencyId),["requester"], "has requester role for agency");
      });
      it('adds a user to an agency updates user document', ()=> {
        const invocation = {userId: adminTestUser};
        addUserToAgencyHandler.apply(invocation, [{userId: testUserId, agencyId: agencyId, role:'requester'}]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.agencyIds.length, 1);
        assert.equal(updatedUser.userData.agencyIds[0], agencyId);
      });
      it('adds a user to an agency adds enrollment document', ()=> {
        const invocation = {userId: adminTestUser};
        addUserToAgencyHandler.apply(invocation, [{userId: testUserId, agencyId: agencyId, role:'requester'}]);
        let enrollment = Enrollments.findOne({userId: testUserId});
        assert.equal(enrollment.userId, testUserId);
        assert.equal(enrollment.agencyId, agencyId);
      });
      it('add a user to an agency fails if no user is provided', ()=> {
        const invocation = {userId: adminTestUser};
        assert.throws(()=>addUserToAgencyHandler.apply(invocation, [{agencyId: agencyId}]), 'User missing. [invalid-user]');
      });
      it('add a user to an agency fails if no agency is provided', ()=> {
        meteorCallStub.withArgs('getAgency').returns('');
        const invocation = {userId: adminTestUser};
        assert.throws(()=>addUserToAgencyHandler.apply(invocation, [{userId: testUserId}]), 'Agency missing. [invalid-agency]');
      });
      it('adds a user to an agency they already belong to does not double enter', ()=> {
        const invocation = {userId: adminTestUser};
        addUserToAgencyHandler.apply(invocation, [{userId: testUserId, agencyId: agencyId}]);
        assert.deepEqual(Roles.getRolesForUser(testUserId, agencyId),["requester"], "has requester role for agency");
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.agencyIds.length, 1);
        assert.equal(updatedUser.userData.agencyIds[0], agencyId);
      });
      it('add a user to an agency when they already have an agency', ()=> {
        let agency2Id = Random.id();
        const invocation = {userId: adminTestUser};
        addUserToAgencyHandler.apply(invocation, [{userId: testUserId, agencyId: agencyId}]);
        addUserToAgencyHandler.apply(invocation, [{userId: testUserId, agencyId: agency2Id}]);
        assert.deepEqual(Roles.getGroupsForUser(testUserId),['noagency',agencyId,agency2Id], "has two agencies");
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.agencyIds.length, 2);
        assert.equal(updatedUser.userData.agencyIds[0], agencyId);
        assert.equal(updatedUser.userData.agencyIds[1], agency2Id);
      });
      it('add a user to an agency changes their role to new role', ()=> {
        const invocation = {userId: adminTestUser};
        addUserToAgencyHandler.apply(invocation, [{userId: testUserId, agencyId: agencyId, role: 'visitor'}]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.isTrue(Roles.userIsInRole(testUserId, "visitor", agencyId),"has visitor role for agency");
        assert.equal(updatedUser.userData.agencyIds.length, 1);
        assert.equal(updatedUser.userData.agencyIds[0], agencyId);
      });
    });

    describe('users.createUserFromAdmin', ()=> {
      const createUserFromAdminHandler = Meteor.server.method_handlers['createUserFromAdmin'];
      let accountsCreateUserSpy;
      let rolesAddRolesStub;
      let testNewUserId;
      let meteorCallStub;
      let findUserByEmailStub;
      let errorsStub;
      let agencyId = Random.id();

      beforeEach(()=> {
        accountsCreateUserSpy = sinon.spy(Accounts, 'createUser');
        rolesAddRolesStub = sinon.stub(Roles, 'addUsersToRoles');
        meteorCallStub = sinon.stub(Meteor, 'call');
        errorsStub = sinon.stub(Errors, 'checkUserIsAdministrator').returns(true);
      });
      afterEach(()=> {
        accountsCreateUserSpy.reset();
        Accounts.createUser.restore();
        rolesAddRolesStub.restore();
        errorsStub.restore();
        Meteor.call.restore();
        testNewUserId = Meteor.users.findOne({emails: {$elemMatch: {address: 'test@email.com'}}});
        if (testNewUserId) {
          Meteor.users.remove(testNewUserId._id);
        }
        if (findUserByEmailStub) {
          Accounts.findUserByEmail.restore();
        }
        findUserByEmailStub = null;
        testNewUserId = null;
      });

      it('User must be logged in to createUser', ()=> {
        const invocation = {userId: null};
        assert.throws(()=>createUserFromAdminHandler.apply(invocation, [{
          email: 'test@email.com',
          userData: {agencyIds: [agencyId]}
        }]), 'Must be logged in to add a user to an agency. [not-logged-in]');
      });

      it('User must be administrator to createUser', ()=> {
        errorsStub.restore();
        const invocation = {userId: testUserId};
        assert.throws(()=>createUserFromAdminHandler.apply(invocation, [{
          email: 'test@email.com',
          userData: {agencyIds: [agencyId]}
        }]), 'Must be an agency administrator to add users to an agency. [unauthorized]');
      });

      it('Accounts.createUser is called', ()=> {
        const invocation = {userId: testUserId};
        createUserFromAdminHandler.apply(invocation, [{email: 'test@email.com', userData: {agencyIds: [agencyId]}}]);
        testNewUserId = Meteor.users.findOne({emails: {$elemMatch: {address: 'test@email.com'}}})._id;
        assert(accountsCreateUserSpy.calledOnce, 'creating account');
        assert(rolesAddRolesStub.calledOnce, 'adding role');
      });

      it('Enrollment record is created', ()=> {
        const invocation = {userId: testUserId};
        createUserFromAdminHandler.apply(invocation, [{email: 'test@email.com', userData: {agencyIds: [agencyId]}}]);
        testNewUserId = Meteor.users.findOne({emails: {$elemMatch: {address: 'test@email.com'}}})._id;
        let enrollment = Enrollments.findOne({userId: testNewUserId});
        assert.equal(enrollment.userId, testNewUserId);
        assert.equal(enrollment.agencyId, agencyId);
      });

      it('If user doesn\'t exist send enrollment email is called', ()=> {
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator'],agencyId);
        createUserFromAdminHandler.apply(invocation, [{email: 'test@email.com', userData: {agencyIds: [agencyId]}}]);
        testNewUserId = Meteor.users.findOne({emails: {$elemMatch: {address: 'test@email.com'}}})._id;
        assert(meteorCallStub.calledWith('sendEnrollmentEmail', testNewUserId));
      });

      it('If user doesn\'t exist send welcome to agency email', ()=> {
        let agencyId = Random.id();
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator'], agencyId);
        createUserFromAdminHandler.apply(invocation, [{email: 'test@email.com', userData: {agencyIds: [agencyId]}}]);
        testNewUserId = Meteor.users.findOne({emails: {$elemMatch: {address: 'test@email.com'}}})._id;
        assert(meteorCallStub.calledWith('sendAgencyWelcomeEmail', testNewUserId, agencyId));
      });

      it('Accounts.createUser returns id', ()=> {
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator'], agencyId);
        testNewUserId = createUserFromAdminHandler.apply(invocation, [{
          email: 'test@email.com',
          userData: {agencyIds: [agencyId]}
        }]);
        assert.equal(testNewUserId, Meteor.users.findOne({emails: {$elemMatch: {address: 'test@email.com'}}})._id)
      });

      it('throws error if Accounts.createUser throws error', ()=> {
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator'], agencyId);
        let error = {reason: 'could not read email of undefined'};
        Accounts.createUser.restore();
        accountsCreateUserSpy = sinon.stub(Accounts, 'createUser');
        accountsCreateUserSpy.throws(error);
        assert.throws(()=>createUserFromAdminHandler.apply(invocation, [{
          email: 'test@email.com',
          userData: {agencyIds: [agencyId]}
        }]), error);
      });

      it('throws error if email exists for visitor ', ()=> {
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator'], agencyId);
        let error = {reason: 'Email already exists.'};
        Accounts.createUser.restore();
        accountsCreateUserSpy = sinon.stub(Accounts, 'createUser');
        accountsCreateUserSpy.throws(error);
        assert.throws(()=>createUserFromAdminHandler.apply(invocation, [{
          email: 'test@email.com',
          role: 'visitor',
          userData: {agencyIds: [agencyId]}
        }]), error);
      });

      it('if email already exists and adding administrator role, addUserToAgency is called', ()=> {
        testNewUserId = Random.id();
        findUserByEmailStub = sinon.stub(Accounts, 'findUserByEmail', ()=>(
          {_id: testNewUserId, userData: {firstName: 'Adam', lastName: 'First'} })
        );
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator'], agencyId);
        let error = {reason: 'Email already exists.'};
        Accounts.createUser.restore();
        accountsCreateUserSpy = sinon.stub(Accounts, 'createUser');
        accountsCreateUserSpy.throws(error);
        let user = {email: 'test@email.com', role: 'administrator', userData: {agencyIds: [agencyId], firstName: 'Adam', lastName: 'First'}};
        createUserFromAdminHandler.apply(invocation, [user]);
        assert(meteorCallStub.calledWith('addUserToAgency', {
          userId: testNewUserId,
          agencyId: user.userData.agencyIds[0],
          role: user.role
        }));
      });

      it('if email already exists but name does not match, throws error', ()=> {
        testNewUserId = Random.id();
        findUserByEmailStub = sinon.stub(Accounts, 'findUserByEmail', ()=>(
          {_id: testNewUserId, userData: {firstName: 'Eve', lastName: 'Second'} })
        );
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator'], agencyId);
        let error = {reason: 'Email already exists.'};
        Accounts.createUser.restore();
        accountsCreateUserSpy = sinon.stub(Accounts, 'createUser');
        accountsCreateUserSpy.throws(error);
        let user = {email: 'test@email.com', role: 'administrator', userData: {agencyIds: [agencyId], firstName: 'Adam', lastName: 'First'}};
        assert.throws(()=>createUserFromAdminHandler.apply(invocation, [user]), error);
      });

      it('if email already exists and user already belongs to agency addUserToAgency returns null', ()=> {
        testNewUserId = Random.id();
        findUserByEmailStub = sinon.stub(Accounts, 'findUserByEmail', ()=>(
          {_id: testNewUserId, userData: {firstName: 'Adam', lastName: 'First'} })
        );
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator'], agencyId);
        let error = {reason: 'Email already exists.'};
        Accounts.createUser.restore();
        accountsCreateUserSpy = sinon.stub(Accounts, 'createUser');
        accountsCreateUserSpy.throws(error);
        let user = {email: 'test@email.com', role: 'administrator', userData: {agencyIds: [agencyId], firstName: 'adam', lastName: 'first'}};
        assert.isNull(createUserFromAdminHandler.apply(invocation, [user]));
      });

    });

    describe('users.addProspectiveAgency method', () => {
      const addProspectiveAgencyHandler = Meteor.server.method_handlers['addProspectiveAgency'];
      var agencyId;

      beforeEach(()=> {
        agencyId = Random.id();
      });

      it('succeeds when user adding one prospective agency', () => {
        const invocation = {userId: testUserId};
        addProspectiveAgencyHandler.apply(invocation, [agencyId]);
        let enrollment = Enrollments.findOne({userId: testUserId});
        assert.equal(enrollment.userId, testUserId);
        assert.equal(enrollment.agencyId, agencyId);
      });
      it('fails when user has already applied to agency', () => {
        const invocation = {userId: testUserId};
        addProspectiveAgencyHandler.apply(invocation, [agencyId]);
        addProspectiveAgencyHandler.apply(invocation, [agencyId]);
        assert.equal( Enrollments.find({userId: testUserId}).count(), 1);
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

      it('succeeds in updating name fields', () => {
        const invocation = {userId: testUserId};
        let data = {userData: {firstName: "Cornelius", lastName: "Clodhopper"}, username: "Corny"};
        updateRegistrationInfoHandler.apply(invocation, [testUserId, data]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.firstName, "Cornelius");
        assert.equal(updatedUser.userData.lastName, "Clodhopper");
        assert.equal(updatedUser.username, "Corny");
        assert.isFalse(meteorCallStub.withArgs('updateUserEmail').calledOnce);
      });

      it('calls updateUserEmail if email passed', () => {
        const invocation = {userId: testUserId};
        let data = {
          userData: {firstName: "Sylvester", lastName: "Sunshine"},
          username: "Sunny",
          email: "sunny@someplace.com"
        };
        updateRegistrationInfoHandler.apply(invocation, [testUserId, data]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.isTrue(meteorCallStub.withArgs('updateUserEmail').calledOnce);
      });
    });

    describe('users.getUserPicture', ()=> {
      const getUserPictureHandler = Meteor.server.method_handlers['getUserPicture'];
      beforeEach(()=> {
        StubCollections.stub(Meteor.users);
      });
      afterEach(()=> {
        StubCollections.restore();
      });

      it('succeeds returns user picture', ()=> {
        const invocation = {userId: testUserId};
        let userWithPictureId = Meteor.users.insert({email: "test@email.com", userData: {picture: "Picture"}});
        let result = getUserPictureHandler.apply(invocation, [userWithPictureId]);
        assert.equal(result, "Picture");
      });
      it('user does not have picture, return undefined', ()=> {
        const invocation = {userId: testUserId};
        let userWithPictureId = Meteor.users.insert({email: "test@email.com", userData: {}});
        let result = getUserPictureHandler.apply(invocation, [userWithPictureId]);
        assert.equal(result, undefined);
      });
      it('user must be logged in to get picture', ()=> {
        const invocation = {userId: null};
        let userWithPictureId = Meteor.users.insert({email: "test@email.com", userData: {picture: "Picture"}});
        assert.throws(()=>getUserPictureHandler.apply(invocation, [userWithPictureId]), 'Must be logged in to view user picture.', 'not-logged-in');
      });
    });

    describe('users.getUserByEmail', ()=> {
      const getUserByEmailHandler = Meteor.server.method_handlers['getUserByEmail'];
      let agencyId = Random.id();
      let errorsStub,findUserByEmailStub ;
      beforeEach(()=> {
        StubCollections.stub([Meteor.users, Enrollments]);
        errorsStub = sinon.stub(Errors, 'checkUserIsAdministrator').returns(true);
      });
      afterEach(()=> {
        StubCollections.restore();
        errorsStub.restore();
        if (findUserByEmailStub) {
          findUserByEmailStub.restore();
        }
      });

      it('User must be administrator to get a user by email', ()=> {
        const invocation = {userId: testUserId};
        errorsStub.restore();
        assert.throws(()=>getUserByEmailHandler.apply(invocation, [agencyId, "test@email.com"]),
          'Must be an agency administrator. [unauthorized]');
      });
      it('succeeds, returns user', ()=> {
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator'], agencyId);
        let requesterId = Random.id();
        Enrollments.insert({userId: requesterId, agencyId: agencyId});
        findUserByEmailStub = sinon.stub(Accounts, 'findUserByEmail', ()=>(
          {_id: requesterId, email:"testy@email.com", userData: {firstName: 'Adam', lastName: 'First'} })
        );
        assert.equal(getUserByEmailHandler.apply(invocation, [agencyId, "testy@email.com"]),requesterId);
      });
      it( 'returns null if no such user email', ()=> {
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator'], agencyId);
        assert.isNull(getUserByEmailHandler.apply(invocation, [agencyId, "test@gamil.com"]));
      });
      it('returns null if user is not in agency', ()=> {
        const invocation = {userId: testUserId};
        Roles.addUsersToRoles(testUserId, ['administrator'], agencyId);
        let requesterId = Random.id();
        findUserByEmailStub = sinon.stub(Accounts, 'findUserByEmail', ()=>(
          {_id: requesterId, email:"testy@email.com", userData: {firstName: 'Adam', lastName: 'First'} })
        );
        assert.isNull(getUserByEmailHandler.apply(invocation, [agencyId, "testy@email.com"]));
      });
    });
  });

  function getTomorrowDate() {
    let tomorrow = new Date()
    tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000))
    return tomorrow
  }

  function getYesterdayDate() {
    let yesterday = new Date()
    yesterday.setTime(yesterday.getTime() - ( 24 * 60 * 60 * 1000))
    return yesterday
  }
}