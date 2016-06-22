/**
 * Created by sarahcoletti on 6/20/16.
 */
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert,expect } from 'meteor/practicalmeteor:chai';

import '/model/visits.js';
import '/server/visits.js';

if (Meteor.isServer) {
  describe('Visits', () => {
    describe('visits.rescindRequest method', () => {
      const rescindHandler = Meteor.server.method_handlers['visits.rescindRequest'];

      const requesterId = Random.id();
      const userId = Random.id();
      let requestId;
      let tomorrow = new Date();
      tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));

      beforeEach(() => {
        Visits.remove({});
        requestId = Visits.insert({
          notes: 'test visit',
          requestedDate: tomorrow,
          createdAt: new Date(),
          requesterId: requesterId,
          location: {
            "name": "Boston",
            "latitude": 42.3601,
            "longitude": -71.0589
          }
        });
      });

      it('can not deactivate requests of another requester', () => {
        // Set up a fake method invocation that looks like what the method expects
        const invocation = {userId: userId};
        try {
          rescindHandler.apply(invocation, [requestId]);
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

      const requesterId = Random.id();
      const userId = Random.id();
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
          visitorId: userId,
          location: {
            "name": "Boston",
            "latitude": 42.3601,
            "longitude": -71.0589
          }
        });
      });

      it('can not cancel visits of another visitor', () => {
        const invocation = {userId: requesterId};
        try {
          cancelScheduledHandler.apply(invocation, [visitId]);
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

      const requesterId = Random.id();
      const userId = Random.id();
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
           location: {
            "name": "Boston",
            "latitude": 42.3601,
            "longitude": -71.0589
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

      const requesterId = Random.id();
      const userId = Random.id();
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
          location: {
            "name": "Boston",
            "latitude": 42.3601,
            "longitude": -71.0589
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
      const userId = Random.id();

      let tomorrow = new Date();
      tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));
      let newVisit = {
        notes: 'test visit',
        requestedDate: tomorrow,
        location: {
          "name": "Boston",
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      };

      beforeEach(() => {
        Visits.remove({});
      });


      it('create Visit success', () => {
        const invocation = {userId: userId};
        createVisitHandler.apply(invocation, [newVisit]);
        assert.equal(Visits.find().count(),1);
      });
    });

  });
}