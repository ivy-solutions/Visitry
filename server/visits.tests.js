/**
 * Created by sarahcoletti on 6/20/16.
 */
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert,expect,fail,to } from 'meteor/practicalmeteor:chai';

import '/model/visits.js';
import '/server/visits.js';

if (Meteor.isServer) {
  describe('Visits', () => {

    const requesterId = Random.id();
    const userId = Random.id();
    const agencyId = Random.id();

    describe('visits.rescindRequest method', () => {
      const rescindHandler = Meteor.server.method_handlers['visits.rescindRequest'];

      let requestId;
      let tomorrow = new Date();
      tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));

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
      let tomorrow = new Date();
      tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));

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
      let tomorrow = new Date();
      tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));

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
      let tomorrow = new Date();
      tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));

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
}