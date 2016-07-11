/**
 * Created by sarahcoletti on 6/20/16.
 */
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert,expect,fail,to } from 'meteor/practicalmeteor:chai';

import '/model/visits.js';
import '/server/visits.js';

if (Meteor.isServer) {

  let tomorrow = new Date();
  tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));
  const requesterId = Random.id();
  const userId = Random.id();
  const agencyId = Random.id();
  var agency2Id = Random.id();
  let yesterday = new Date();
  yesterday.setTime(yesterday.getTime() - ( 24 * 60 * 60 * 1000));


  describe('Visits', () => {

    describe('visits.rescindRequest method', () => {
      const rescindHandler = Meteor.server.method_handlers['visits.rescindRequest'];

      let requestId;

      beforeEach(() => {
        Visits.remove({});
        requestId = Visits.insert({
          notes: 'test visit',
          agencyId: agencyId,
          requestedDate: tomorrow,
          createdAt: new Date(),
          requesterId: requesterId,
          location: {
            name: "Boston",
            geo: {
              type: "Point",
              coordinates: [-71.0589, 42.3601]
            }
          }
        });
      });

      it('can not deactivate requests of another requester', () => {
        // Set up a fake method invocation that looks like what the method expects
        const invocation = {userId: userId};
        try {
          rescindHandler.apply(invocation, [requestId]);
          fail("expected not-authorized exception");
        } catch (ex) {
          assert.equal(ex.error, 'not-authorized')
        }
      });

      it('can deactivate own visit requests', () => {
        const invocation = {userId: requesterId};
        rescindHandler.apply(invocation, [requestId]);
        assert.equal(Visits.find({inactive:null}).count(), 0);
      });

      it('remove visit request once visit is booked, updates visit as inactive instead', () => {
        Visits.update(requestId, {$set: {visitorId: userId}});
        const invocation = {userId: requesterId};
        rescindHandler.apply(invocation, [requestId]);
        assert.equal(Visits.find({inactive:null}).count(), 0);
      });

    });

    describe('visits.cancelScheduled method', () => {
      const cancelScheduledHandler = Meteor.server.method_handlers['visits.cancelScheduled'];

      let visitId;

      beforeEach(() => {
        Visits.remove({});
        visitId = Visits.insert({
          notes: 'test visit',
          agencyId: agencyId,
          requestedDate: tomorrow,
          createdAt: new Date(),
          requesterId: requesterId,
          visitorId: userId,
          location: {
            name: "Boston",
            geo: {
              type: "Point",
              coordinates: [-71.0589, 42.3601]
            }
          }
        });
      });

      it('can not cancel visits of another visitor', () => {
        const invocation = {userId: requesterId};
        try {
          cancelScheduledHandler.apply(invocation, [visitId]);
          fail("expected not-authorized exception");
        } catch (ex) {
          assert.equal(ex.error, 'not-authorized')
        }
      });

      it('can cancel own visits', () => {
        const invocation = {userId: userId};
        cancelScheduledHandler.apply(invocation, [visitId]);
        assert.equal(Visits.find({visitorId:userId}).count(), 0);
        assert.equal(Visits.find({}).count(), 1);
      });

    });

    describe('visits.scheduleVisit method', () => {
      const scheduleVisitHandler = Meteor.server.method_handlers['visits.scheduleVisit'];

      let visitId;

      beforeEach(() => {
        Visits.remove({});
        visitId = Visits.insert({
          notes: 'test visit',
          requestedDate: tomorrow,
          createdAt: new Date(),
          agencyId: agencyId,
          requesterId: requesterId,
          location: {
            name: "Boston",
            geo: {
              type: "Point",
              coordinates: [-71.0589, 42.3601]
            }
          }
        });
      });


      it('schedule visit success', () => {
        const invocation = {userId: userId};
        scheduleVisitHandler.apply(invocation, [visitId, new Date(), "message"]);
        assert.equal(Visits.find({visitorId:userId}).count(), 1);
        var updatedVisit = Visits.findOne({visitorId:userId});
        assert.equal(updatedVisit.visitorNotes,"message");
        assert.instanceOf(updatedVisit.visitTime,Date, 'visitTime');
        assert.instanceOf(updatedVisit.scheduledAt,Date, 'scheduledAt');
      });

    });

    describe('visits.attachFeedback method', () => {
      const attachFeedbackHandler = Meteor.server.method_handlers['visits.attachFeedback'];

      const feedbackId = Random.id();
      let visitId;

      beforeEach(() => {
        Visits.remove({});
        visitId = Visits.insert({
          notes: 'test visit',
          requestedDate: tomorrow,
          createdAt: new Date(),
          requesterId: requesterId,
          agencyId: agencyId,
          location: {
            name: "Boston",
            geo: {
              type: "Point",
              coordinates: [-71.0589, 42.3601]
            }
          }
        });
      });


      it('attach feedback success', () => {
        const invocation = {userId: userId};
        attachFeedbackHandler.apply(invocation, [visitId, feedbackId]);
        var updatedVisit = Visits.findOne({_id:visitId});
        assert.equal(updatedVisit.feedbackId,feedbackId);
      });
    });

    describe('visits.createVisit method', () => {
      const createVisitHandler = Meteor.server.method_handlers['visits.createVisit'];

      let tomorrow = new Date();
      tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));
      let newVisit = {
        notes: 'test visit',
        requestedDate: tomorrow,
        location: {
           name: "Boston",
           geo: {
             type: "Point",
             coordinates: [-71.0589, 42.3601]
           }
        }
      };

      var findOneUserStub;
      beforeEach(() => {
        findOneUserStub = sinon.stub(Meteor.users, 'findOne');
        findOneUserStub.returns( {
          username: 'Harry',
          userData: {
            agencyId: agencyId
          }
        });

        Visits.remove({});
      });

      afterEach( function() {
          Meteor.users.findOne.restore();
      });

      it('fails if no location in request', () => {
        const invocation = {userId: userId};
        let nowhereVisit = {
          notes: 'test visit',
          requestedDate: tomorrow
        };
        try {
          createVisitHandler.apply(invocation, [nowhereVisit]);
          fail( "expect error");
        }catch( ex ) {
          assert.match(ex.message, /Location is required/)
        }
      });

      it('fails if requester does not have agencyId', () => {
        const invocation = {userId: userId};
        findOneUserStub.returns( { username: 'No Agency', userData:{}} );
        try {
          createVisitHandler.apply(invocation, [newVisit]);
          fail("expected requires-agency exception");
        } catch (ex) {
          assert.equal(ex.error, 'requires-agency', ex)
        }
      });

      it('create Visit success', () => {
        const invocation = {userId: userId};
        createVisitHandler.apply(invocation, [newVisit]);
        assert.equal(Visits.find().count(),1);
      });
    });

  });

  describe( 'availableVisits Publication', () => {
    const publication = Meteor.server.publish_handlers["availableVisits"];

    var findOneUserStub;


    beforeEach(() => {
      findOneUserStub = sinon.stub(Meteor.users, 'findOne');
      findOneUserStub.returns({
        _id: userId,
        username: 'Harriet',
        userData: {
          agencyId: agency2Id
        }
      });

      Visits.remove({});
      insertTestVisits();
    });

    afterEach( function() {
      Meteor.users.findOne.restore();
    });

    it('returns needed fields [notes, requesterId, requestedDate, location]', () => {
      const invocation = {userId: userId};

      const cursors = publication.apply(invocation);

      const visitCursor = cursors[0];
      assert.equal(visitCursor.count(), 1);
      var visit = visitCursor.fetch()[0];
      assert.isString(visit.notes, "notes");
      assert.isString(visit.requesterId, "requesterId");
      assert.instanceOf(visit.requestedDate, Date, "requestedDate");
      assert.isString(visit.location.name,"location.name");
    });

    it('user of agency2 should see only agency2 visits', () => {
      const invocation = {userId: userId};

      const cursors = publication.apply(invocation);

      const visitCursor = cursors[0];
      assert.equal(visitCursor.count(), 1);
      var visit = visitCursor.fetch()[0];
      assert.equal(visit.notes,'test visit agency2', JSON.stringify(visit));
    });

    it('user associated with no agency should see no visits', () => {
      findOneUserStub.returns( { username: 'UnaffiliatedUser', userData:{}} );
      const invocation = {userId: userId};

      const cursors = publication.apply(invocation);
      const visitCursor = cursors[0];
      assert.equal(visitCursor.count(), 0);
    });

    it('agency1 user sees only future unscheduled visits', () => {
      findOneUserStub.returns( { username: 'agency1user', userData:{agencyId: agencyId}} );
      const invocation = {userId: userId};

      const cursors = publication.apply(invocation);
      const visitCursor = cursors[0];
      assert.equal(visitCursor.count(), 1);
      var visit = visitCursor.fetch()[0];
      assert.equal(visit.notes, 'test visit agency1', JSON.stringify(visit));
    });

  });

  describe( 'userRequests Publication', () => {
    const publication = Meteor.server.publish_handlers["userRequests"];

    beforeEach(() => {
      Visits.remove({});
      insertTestVisits();
    });

    afterEach(function () {
    });

    it('user with no visit requests', () => {
      const invocation = {userId: userId};

      const cursors = publication.apply(invocation);
      const visitCursor = cursors[0];
      assert.equal(visitCursor.count(), 0);
    });
    it('user sees his own visit requests - future or with no feedback', () => {
      const invocation = {userId: requesterId};

      const cursors = publication.apply(invocation);
      const visitCursor = cursors[0];
      assert.equal(visitCursor.count(), 4);
      var visit = visitCursor.fetch()[0];
      assert.equal(visit.notes, 'test visit agency1', JSON.stringify(visit));
    });
  });

  function insertTestVisits() {
    Visits.insert({
      notes: 'test visit agency1',
      requestedDate: tomorrow,
      createdAt: new Date(),
      requesterId: requesterId,
      agencyId: agencyId,
      location: {
        name: "Boston",
        geo: {
          type: "Point",
          coordinates: [-71.0589, 42.3601]
        }
      }
    });
    Visits.insert({
      notes: 'past visit agency1',
      requestedDate: yesterday,
      createdAt: new Date(),
      requesterId: requesterId,
      agencyId: agencyId,
      location: {
        name: "Boston",
        geo: {
          type: "Point",
          coordinates: [-71.0589, 42.3601]
        }
      }
    });
      Visits.insert({
        notes: 'past visit agency1 with feedback',
        requestedDate: yesterday,
        createdAt: new Date(),
        requesterId: requesterId,
        agencyId: agencyId,
        location: {
          name: "Boston",
          geo: {
            type: "Point",
            coordinates: [-71.0589, 42.3601]
          }
        },
        feedbackId: Random.id()
      });
    Visits.insert({
      notes: 'scheduled visit agency1',
      requestedDate: tomorrow,
      createdAt: new Date(),
      requesterId: requesterId,
      visitorId: userId,
      agencyId: agencyId,
      location: {
        name: "Boston",
        geo: {
          type: "Point",
          coordinates: [-71.0589, 42.3601]
        }
      }
    });
    Visits.insert({
      notes: 'test visit agency2',
      requestedDate: tomorrow,
      createdAt: new Date(),
      requesterId: requesterId,
      agencyId: agency2Id,
      location: {
        name: "Boston",
        geo: {
          type: "Point",
          coordinates: [-71.0589, 42.3601]
        }
      }
    });
  }

}