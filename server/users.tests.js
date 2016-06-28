/**
 * Created by sarahcoletti on 6/22/16.
 */
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert,expect,fail } from 'meteor/practicalmeteor:chai';

import '/server/users.js';

if (Meteor.isServer) {
  describe('Users', () => {

    var testUserId;
    beforeEach(() => {
      var user = Meteor.users.findOne({username: 'testUser'});
      if (!user) {
        testUserId = Accounts.createUser({username: 'testUser', password: 'Visitry99'});
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
        updateNameHandler.apply(invocation, ["firstName", "lastName", "visitor"]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.firstName, "firstName");
        assert.equal(updatedUser.userData.lastName, "lastName");
        assert.equal(updatedUser.userData.role, "visitor");
      });

      it('fails when user is not logged in', () => {
        const invocation = {userId: null};
        try {
          updateNameHandler.apply(invocation, ["firstName", "lastName", "visitor"]);
          fail("expected exception");
        } catch (ex) {
          assert.equal( ex.error, 'not-logged-in')
        }
      });

      it('fails when no firstName passed', () => {
        const invocation = {userId: testUserId};
        try {
          updateNameHandler.apply(invocation, [, "lastName", "visitor"]);
          fail("expected exception");
        } catch (err) {
          assert.equal( err.errorType, 'Match.Error', err)
        }
      });
      it('fails when no lastName passed', () => {
        const invocation = {userId: testUserId};
        try {
          updateNameHandler.apply(invocation, ["First", null, "visitor"]);
          fail("expected exception");
        } catch (err) {
          assert.equal( err.errorType, 'Match.Error', err)
        }
      });
      it('fails when no role passed', () => {
        const invocation = {userId: testUserId};
        try {
          updateNameHandler.apply(invocation, ["First", "Last"]);
          fail("expected exception");
        } catch (err) {
          assert.equal( err.errorType, 'Match.Error', err)
        }
      });

    });

    describe('users.updateLocation method', () => {
      const updateLocationHandler = Meteor.server.method_handlers['updateLocation'];

      const location = { name: "some place", latitude: 42.12345, longitude: -71.23}
      it('succeeds when valid location passed', () => {
        const invocation = {userId: testUserId};
        updateLocationHandler.apply(invocation, [location, 10]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.location.name, location.name);
        assert.equal(updatedUser.userData.location.geo.coordinates[1], location.latitude);
        assert.equal(updatedUser.userData.location.geo.coordinates[0], location.longitude);
        assert.equal(updatedUser.userData.vicinity, 10);
      });

      it('fails when user is not logged in', () => {
        const invocation = {userId: null};
        try {
          updateLocationHandler.apply(invocation, [location,10]);
          fail("expected exception");
        } catch (ex) {
          assert.equal( ex.error, 'not-logged-in')
        }
      });

    });

    describe('users.updatePicture method', () => {
      const updatePictureHandler = Meteor.server.method_handlers['updatePicture'];

      it('succeeds when valid first and last name passed', () => {
        const invocation = {userId: testUserId};
        updatePictureHandler.apply(invocation, ["pictureData"]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.picture, "pictureData");
      });

      it('fails when user is not logged in', () => {
        const invocation = {userId: null};
        try {
          updatePictureHandler.apply(invocation, ["pictureData"]);
          fail("expected exception");
        } catch (ex) {
          assert.equal( ex.error, 'not-logged-in')
        }
      });

    });
    describe('users.updateUserData method', () => {
      const updateUserDataHandler = Meteor.server.method_handlers['updateUserData'];

      it('succeeds when valid first and last name passed', () => {
        const invocation = {userId: testUserId};
        updateUserDataHandler.apply(invocation, [{role:"visitor", vicinity:"20"}]);
        var updatedUser = Meteor.users.findOne({_id: testUserId});
        assert.equal(updatedUser.userData.role, "visitor");
        assert.equal(updatedUser.userData.vicinity, 20);
      });

      it('fails when user is not logged in', () => {
        const invocation = {userId: null};
        try {
          updateUserDataHandler.apply(invocation, [{role:"visitor", vicinity:"20"}]);
          fail("expected exception");
        } catch (ex) {
          assert.equal( ex.error, 'not-logged-in')
        }
      });
      it('fails when invalid vicinity', () => {
        const invocation = {userId: testUserId};
        try {
          updateUserDataHandler.apply(invocation, [{role:"visitor", vicinity:null}]);
          fail("expected exception");
        } catch (err) {
          assert.equal( err.errorType, 'Match.Error', err)
        }
      });

    });
  });
}