/**
 * Created by sarahcoletti on 4/6/17.
 */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert,expect,fail } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import {Roles} from 'meteor/alanning:roles'
import '/server/users.js';
import '/model/users.js'
import {Enrollment} from '/model/enrollment'

describe('User Publication', () => {
  describe('visitorUsers', () => {

    var countsPublishStub;
    var agency1Id;
    var agency2Id;
    var userId;
    var testUserId;
    var enrollmentFindStub;
    var meteorCallStub;

    beforeEach(()=> {
      agency1Id = Random.id();
      agency2Id = Random.id();
      userId = Random.id();

      countsPublishStub = sinon.stub(Counts, 'publish');
      enrollmentFindStub = sinon.stub(Enrollment, 'findOne');
      enrollmentFindStub.returns({approvalDate: new Date()});
      meteorCallStub = sinon.stub(Meteor, 'call');
      meteorCallStub.returns([{visitorRating: 5, visitorHours: 120}]);

      testUserId = Accounts.createUser({
        username: 'Adam1', email: 'adam1@aol.com', password: 'Visitry99', role: 'visitor',
        userData: {
          firstName: 'Adam',
          lastName: 'Mudd',
          agencyIds: [agency1Id],
          location: {
            address: "1 Garden St., Eden",
            formattedAddress: "1 Garden St., Eden",
            geo: {
              type: "Point",
              coordinates: [-71.078006, 42.369707]
            }
          },
          visitRange: 10,
          about: "First guy. Wish I had someone to visit"
        }
      });
      Roles.addUsersToRoles(testUserId, 'visitor', agency1Id);
    });

    afterEach(()=> {
      Meteor.users.remove(testUserId);
      Counts.publish.restore();
      Enrollment.findOne.restore();
      Meteor.call.restore();
    });

    it('returns needed fields [userData.firstName, userData.lastName, visitorRating, visitorHours, userData.location.address, joinedAgencyOn]', () => {
      const publication = Meteor.server.publish_handlers["visitorUsers"];
      let visitors = [];
      const invocation = {
        userId: userId,
        ready: function () {
          return true;
        },
        added: function (collection, userId, user) {
          visitors.push(user);
        },
        removed: function (collection, userId) {
        },
        onStop: function () {
        }
      };
      publication.apply(invocation, [agency1Id]);
      var visitor = visitors[visitors.length - 1];  //last one added
      assert.isString(visitor.userData.firstName, "firstName");
      assert.isString(visitor.userData.lastName, "lastName");
      assert.isNotNull(visitor.visitorRating, "visitorRating");
      assert.isNotNull(visitor.visitorHours, "visitorHours");
      assert.isString(visitor.userData.location.address, "location.address");
      assert.instanceOf(visitor.joinedAgencyOn, Date, "joinedAgencyOn");
    });
  });

});