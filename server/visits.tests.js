/**
 * Created by sarahcoletti on 6/20/16.
 */
import {Meteor} from 'meteor/meteor'
import {Random} from 'meteor/random'
import {assert, expect, fail, to} from 'meteor/practicalmeteor:chai'
import {sinon} from 'meteor/practicalmeteor:sinon'
import {Visit, Visits} from '/model/visits'
import {Counts} from 'meteor/tmeasday:publish-counts'
import '/server/visits.js'
import '/model/users'
import '/model/visits-methods'
import {TestVisits} from '/model/test/test-visits'

if (Meteor.isServer) {

  /*  const requesterId = Random.id();
   const userId = Random.id();
   const agencyId = Random.id();
   let agency2Id = Random.id();*/

  describe('Visits', () => {
    var findUserStub
    var meteorStub
    var testVisit
    var requesterId
    var userId
    var agency1Id
    var agency2Id
    var visitId

    beforeEach(() => {
      meteorStub = sinon.stub(Meteor, 'call')
      requesterId = Random.id()
      userId = Random.id()
      agency1Id = Random.id()
      findUserStub = sinon.stub(User, 'findOne')
      findUserStub.returns({
        username: 'Thelma',
        fullname: "Thelma Smith",
        userData: {firstName: "Thelma", lastName: "Smith", agencyIds: [agency1Id]}
      })

      testVisit = {
        notes: 'test visit',
        requestedDate: getTomorrowDate(),
        createdAt: new Date(),
        agencyId: agency1Id,
        requesterId: requesterId,
        location: {
          address: "Boston",
          formattedAddress: "Boston",
          geo: {
            type: "Point",
            coordinates: [-71.0589, 42.3601]
          }
        }
      }

    })
    afterEach(function () {
      User.findOne.restore()
      meteorStub.restore()
    })

    describe('visits.rescindRequest method', () => {
      const rescindHandler = Meteor.server.method_handlers['visits.rescindRequest']
      let adminId
      let rolesUserInRoleStub

      beforeEach(() => {
        visitId = Visits.insert(testVisit)
        adminId = Random.id()
        rolesUserInRoleStub = sinon.stub(Roles, 'userIsInRole').withArgs(adminId, 'administrator', testVisit.agencyId).returns(true)
      })
      afterEach(() => {
        Roles.userIsInRole.restore();
        Visits.remove({})
      })

      it('can not deactivate requests of another requester', () => {
        // Set up a fake method invocation that looks like what the method expects
        const invocation = {userId: userId}
        try {
          rescindHandler.apply(invocation, [visitId])
          fail("expected not-authorized exception")
        } catch (ex) {
          assert.equal(ex.error, 'not-authorized')
        }
      })

      it("not found error if try to cancel a visit that doesn't exist", () => {
        const invocation = {userId: userId}
        try {
          rescindHandler.apply(invocation, ['badvisitId'])
          fail("expected not-found exception")
        } catch (ex) {
          assert.equal(ex.error, 'not-found')
        }
      })

      it('can deactivate own visit requests', () => {
        const invocation = {userId: requesterId}
        rescindHandler.apply(invocation, [visitId])
        assert.equal(Visits.find({inactive: null}).count(), 0)
        assert.equal(Visits.find({inactive: true}).count(), 1)
      })

      it('admin can rescind request', () => {
        const invocation = {userId: adminId}
        rescindHandler.apply(invocation, [visitId])
        assert.equal(Visits.find({inactive: null}).count(), 0)
        assert.equal(Visits.find({inactive: true}).count(), 1)
      })

      it('remove visit request once visit is booked, updates visit as inactive instead', () => {
        Visits.update(visitId, {$set: {visitorId: userId}})
        const invocation = {userId: requesterId}
        rescindHandler.apply(invocation, [visitId])
        assert.equal(Visits.find({inactive: null}).count(), 0)
        assert.equal(Visits.find({inactive: true}).count(), 1)
      })

      it('sends a notification if the request has been rescinded', () => {
        Visits.update(visitId, {$set: {visitorId: userId}})
        const invocation = {userId: requesterId}
        rescindHandler.apply(invocation, [visitId])
        assert(Meteor.call.calledWith('notifications.visitCancelled'), "notifications.visitCancelled called")
      })

    })

    describe('visits.cancelScheduled method', () => {
      const cancelScheduledHandler = Meteor.server.method_handlers['visits.cancelScheduled']

      beforeEach(() => {
        testVisit.visitorId = userId
        testVisit.visitTime = getTomorrowDate()
        visitId = Visits.insert(testVisit)
      })
      afterEach(() => {
        Visits.remove({})
      })

      it('cannot cancel visits of another visitor', () => {
        const invocation = {userId: requesterId}
        try {
          cancelScheduledHandler.apply(invocation, [visitId])
          fail("expected not-authorized exception")
        } catch (ex) {
          assert.equal(ex.error, 'not-authorized')
        }
      })

      it("not found error if try to cancel a visit that doesn't exist", () => {
        const invocation = {userId: userId}
        try {
          cancelScheduledHandler.apply(invocation, ['badvisitId'])
          fail("expected not-found exception")
        } catch (ex) {
          assert.equal(ex.error, 'not-found')
        }
      })

      it('can cancel own visits', () => {
        const invocation = {userId: userId}
        cancelScheduledHandler.apply(invocation, [visitId])
        assert.equal(Visits.find({visitorId: userId}).count(), 0)
        assert.equal(Visits.find({}).count(), 1)
      })

      it('sends a notification if the visit had been scheduled', () => {
        const invocation = {userId: userId}
        cancelScheduledHandler.apply(invocation, [visitId])
        assert(Meteor.call.calledWith('notifications.visitCancelled'), "notifications.visitCancelled called")
      })
    })

    describe('visits.scheduleVisit method', () => {
      const scheduleVisitHandler = Meteor.server.method_handlers['visits.scheduleVisit']

      beforeEach(() => {
        visitId = Visits.insert(testVisit)
      })

      afterEach(() => {
        Visits.remove({})
      })

      it('schedule visit success', () => {
        const invocation = {userId: userId}
        scheduleVisitHandler.apply(invocation, [visitId, getTomorrowDate(), "message"])
        assert.equal(Visits.find({visitorId: userId}).count(), 1)
        var updatedVisit = Visits.findOne({visitorId: userId})
        assert.equal(updatedVisit.visitorNotes, "message")
        assert.instanceOf(updatedVisit.visitTime, Date, 'visitTime')
        assert.instanceOf(updatedVisit.scheduledAt, Date, 'scheduledAt')
      })

      it('sends a notification to requester', () => {
        const invocation = {userId: userId}
        scheduleVisitHandler.apply(invocation, [visitId, getTomorrowDate(), "message"])
        assert(Meteor.call.calledWith('notifications.visitScheduled'), "notifications.visitScheduled called")
      })
    })

    describe('visits.attachFeedback method', () => {
      const attachFeedbackHandler = Meteor.server.method_handlers['visits.attachFeedback']
      var feedbackId

      beforeEach(() => {
        feedbackId = Random.id()
        testVisit.visitorId = userId
        visitId = Visits.insert(testVisit)
      })
      afterEach(() => {
        Visits.remove({})
      })

      it('attach requester feedback success', () => {
        const invocation = {userId: requesterId}
        attachFeedbackHandler.apply(invocation, [visitId, feedbackId])
        var updatedVisit = Visits.findOne({_id: visitId})
        assert.equal(updatedVisit.requesterFeedbackId, feedbackId)
      })
      it('attach visitor feedback success', () => {
        const invocation = {userId: userId}
        attachFeedbackHandler.apply(invocation, [visitId, feedbackId])
        var updatedVisit = Visit.findOne({_id: visitId})
        assert.equal(updatedVisit.visitorFeedbackId, feedbackId)
      })
      it('cannot attach feedback for user that was not a requester or a visitor', () => {
        const invocation = {userId: Random.id()}
        try {
          attachFeedbackHandler.apply(invocation, [visitId, feedbackId])
          fail("expected not-authorized")
        } catch (ex) {
          assert.equal(ex.error, 'not-authorized')
        }
      })
    })

    describe('visits.createVisit method', () => {
      const createVisitHandler = Meteor.server.method_handlers['visits.createVisit']
      let newVisit
      let adminId

      beforeEach(() => {
        adminId = Random.id()
        findUserStub.returns({
          username: 'Harry',
          userData: {
            agencyIds: [agency1Id]
          }
        })

        newVisit = new Visit({
          notes: 'test visit',
          requestedDate: getTomorrowDate(),
          location: {
            address: "Boston",
            formattedAddress: "Boston",
            geo: {
              type: "Point",
              coordinates: [-71.0589, 42.3601]
            }
          }
        })
      })

      afterEach(function () {
        Visits.remove({})
        Meteor.call.restore()
      })

      it('fails if no location in request', () => {
        const invocation = {userId: userId}
        newVisit = new Visit({
          notes: 'test visit',
          requestedDate: getTomorrowDate()
        })
        try {
          createVisitHandler.apply(invocation, [newVisit])
          fail("expect error")
        } catch (ex) {
          assert.match(ex.message, /"location" is required/)
        }
      })

      it('fails if requester does not have agencyId', () => {
        const invocation = {userId: userId}
        findUserStub.returns({username: 'No Agency', userData: {}})
        try {
          createVisitHandler.apply(invocation, [newVisit])
          assert.fail("expected requires-agency exception")
        } catch (ex) {
          console.log(ex)
          assert.equal(ex.error, 'requires-agency', ex)
        }
      })

      it('create Visit success', () => {
        const invocation = {userId: userId}
        createVisitHandler.apply(invocation, [newVisit])
        assert.equal(Visits.find().count(), 1)
      })

      it('create Visit can notify preferred visitors', () => {
        const invocation = {userId: userId}
        createVisitHandler.apply(invocation, [newVisit])
        assert(Meteor.call.calledWith('notifications.newVisitRequest'), "notifications called")
      })

      it('create Visit as an administrator', () => {
        const invocation = {userId: adminId}
        newVisit.requesterId = userId
        createVisitHandler.apply(invocation, [newVisit])
        assert.equal(Visits.find().count(), 1)
      })

      it('create Visit as an administrator notifies requester and preferred visitors', () => {
        const invocation = {userId: adminId}
        newVisit.requesterId = userId
        createVisitHandler.apply(invocation, [newVisit])
        assert(Meteor.call.calledWith('notifications.newVisitRequest'), "notifications called")
        assert(Meteor.call.calledWith('notifications.visitCreatedByAdmin'), "notifications called")
      })

    })
  })

  describe('availableVisits Publication', () => {
    const publication = Meteor.server.publish_handlers["availableVisits"]
    Visits._ensureIndex({"location.geo.coordinates": '2dsphere'})
    var findOneUserStub
    var countsPublishStub
    var rolesStub
    var agency1Id
    var agency2Id
    var requesterId
    var userId

    beforeEach(function () {
      agency1Id = Random.id()
      requesterId = Random.id()
      agency2Id = Random.id()
      userId = Random.id()
      findOneUserStub = sinon.stub(Meteor.users, 'findOne')
      findOneUserStub.returns({
        _id: userId,
        username: 'Harriet',
        userData: {
          agencyIds: [agency2Id]
        }
      })
      rolesStub = sinon.stub(Roles, 'getGroupsForUser').returns([agency1Id])
      countsPublishStub = sinon.stub(Counts, 'publish')
      insertTestVisits(requesterId, agency1Id, agency2Id, userId)
    })


    afterEach(function () {
      Visits.remove({})
      Meteor.users.findOne.restore()
      Counts.publish.restore()
      rolesStub.restore()
    })

    it('returns needed fields [notes, requesterId, requestedDate, location]', () => {
      const invocation = {userId: userId}
      const cursors = publication.apply(invocation, [userId, true])
      const visitCursor = cursors[0]
      assert.equal(visitCursor.count(), 1)
      var visit = visitCursor.fetch()[0]
      assert.isString(visit.notes, "notes")
      assert.isString(visit.requesterId, "requesterId")
      assert.instanceOf(visit.requestedDate, Date, "requestedDate")
      assert.isString(visit.location.address, "location.address")
    })

    it('user of agency2 should see only agency2 visits', () => {
      const invocation = {userId: userId}
      rolesStub.returns([agency2Id])
      const cursors = publication.apply(invocation, [userId, true])
      const visitCursor = cursors[0]
      assert.equal(visitCursor.count(), 1)
      var visit = visitCursor.fetch()[0]
      assert.equal(visit.notes, 'future unscheduled visit for agency: ' + agency2Id, JSON.stringify(visit))
    })

    it('agency1 user sees only future unscheduled visits', () => {
      const invocation = {userId: userId}
      const cursors = publication.apply(invocation, [userId, true])
      const visitCursor = cursors[0]
      assert.equal(visitCursor.count(), 1)
      var visit = visitCursor.fetch()[0]
      assert.equal(visit.notes, 'future unscheduled visit for agency: ' + agency1Id, JSON.stringify(visit))
    })

    it('user associated with multiple agencies should see visits from all', () => {
      rolesStub.returns([agency1Id, agency2Id])
      const invocation = {userId: userId}
      const cursors = publication.apply(invocation, [userId, true])
      const visitCursor = cursors[0]
      assert.equal(visitCursor.count(), 2)
      const notesFromVisits = visitCursor.map(function (visit) {
        return visit.notes
      })
      assert.sameMembers(notesFromVisits, ['future unscheduled visit for agency: ' + agency1Id, 'future unscheduled visit for agency: ' + agency2Id])
    })

    it('user from Acton sees no visits if visitRange is set to 10 miles', () => {
      findOneUserStub.returns({
        username: 'Actonian',
        userData: {
          agencyIds: [agency1Id],
          visitRange: 10,
          location: {
            address: "Acton",
            formattedAddress: "Acton",
            geo: {
              type: "Point",
              coordinates: [-71.432612, 42.485008]
            }
          }
        }
      })

      const invocation = {userId: userId}
      const cursors = publication.apply(invocation, [userId, true])
      const visitCursor = cursors[0]
      assert.equal(visitCursor.count(), 0)
    })

    it('user from Acton sees 1 visit if visitRange is set to 50 miles', () => {
      findOneUserStub.returns({
        username: 'Actonian',
        userData: {
          agencyIds: [agency1Id],
          visitRange: 50,
          location: {
            address: "Acton",
            formattedAddress: "Acton",
            geo: {
              type: "Point",
              coordinates: [-71.432612, 42.485008]
            }
          }
        }
      })

      const invocation = {userId: userId}
      const cursors = publication.apply(invocation, [userId, true])
      const visitCursor = cursors[0]
      assert.equal(visitCursor.count(), 1)
    })
  })
/////
  describe('userRequests Publication', () => {
    const publication = Meteor.server.publish_handlers["userRequests"]

    var agency1Id
    var requesterId
    var agency2Id
    var userId
    var tomorrow

    beforeEach(() => {
      agency1Id = Random.id()
      requesterId = Random.id()
      agency2Id = Random.id()
      userId = Random.id()

      insertTestVisits(requesterId, agency1Id, agency2Id, userId)
    })

    afterEach(function () {
      Visits.remove({})
    })

    it('user with no visit requests', () => {
      const invocation = {userId: userId}
      const cursors = publication.apply(invocation, [userId])
      const visitCursor = cursors[0]
      assert.equal(visitCursor.count(), 0)
    })

    it('user sees his own visit requests - future or with no feedback', () => {
      const invocation = {userId: requesterId}
      const cursors = publication.apply(invocation, [requesterId])
      const visitCursor = cursors[0]
      var visit = visitCursor.fetch()[0]
      var notesFromVisits = visitCursor.map(function (visit) {
        return visit.notes
      })
      assert.sameMembers(notesFromVisits, ['future unscheduled visit for agency: ' + agency1Id, 'future scheduled visit for agency: ' + agency1Id, 'future unscheduled visit for agency: ' + agency2Id])
      assert.equal(visitCursor.count(), 3, notesFromVisits)
    })

  })

  describe('visits Publication', () => {
    var findOneUserStub

    const publication = Meteor.server.publish_handlers["visits"]

    var agency1Id
    var requesterId
    var agency2Id
    var userId
    let countsPublishStub

    beforeEach(() => {
      agency1Id = Random.id()
      requesterId = Random.id()
      agency2Id = Random.id()
      userId = Random.id()

      insertTestVisits(requesterId, agency1Id, agency2Id, userId)
      findOneUserStub = sinon.stub(Meteor.users, 'findOne')
      findOneUserStub.returns({
        username: 'Harry',
        userData: {
          agencyIds: [agency1Id]
        }
      })
      countsPublishStub = sinon.stub(Counts, 'publish')
    })

    afterEach(function () {
      Visits.remove({})
      Meteor.users.findOne.restore()
      Counts.publish.restore()
    })

    it('requester gets own future visits in agency1 and past scheduled requests where that have no requester feedback', () => {
      const invocation = {userId: requesterId}
      const visitCursor = publication.apply(invocation, [])
      var notesFromVisits = visitCursor.map(function (visit) {
        return visit.notes
      })
      assert.equal(visitCursor.count(), 2, notesFromVisits)
      assert.sameMembers(notesFromVisits, ['future unscheduled visit for agency: ' + agency1Id, 'future scheduled visit for agency: ' + agency1Id])
    })

    it('visitor gets unscheduled future visit requests and self-scheduled in future or without visitor feedback', () => {
      const invocation = {userId: userId}
      const visitCursor = publication.apply(invocation)
      var notesFromVisits = visitCursor.map(function (visit) {
        return visit.notes
      })
      assert.sameMembers(notesFromVisits, ['future unscheduled visit for agency: ' + agency1Id, 'past visit with requester feedback for agency: ' + agency1Id, 'future scheduled visit for agency: ' + agency1Id])
      assert.equal(visitCursor.count(), 3, notesFromVisits)
    })

  })

  describe('agencyVisits Publication', () => {

    const publication = Meteor.server.publish_handlers["agencyVisits"]

    var agency1Id
    var requesterId
    var agency2Id
    var userId
    let countsPublishStub
    let usersFindStub

    beforeEach(() => {
      agency1Id = Random.id()
      requesterId = Random.id()
      agency2Id = Random.id()
      userId = Random.id()

      insertTestVisits(requesterId, agency1Id, agency2Id, userId)
      countsPublishStub = sinon.stub(Counts, 'publish')
    })

    afterEach(function () {
      Visits.remove({})
      Counts.publish.restore()
    })

    it('visits from agency1', () => {
      const invocation = {userId: requesterId}
      const cursors = publication.apply(invocation, [agency1Id])
      const visitCursor = cursors[0]
      assert.equal(visitCursor.count(), 5)
    })
    it('visits from agency2', () => {
      const invocation = {userId: requesterId}
      const cursors = publication.apply(invocation, [agency2Id])
      const visitCursor = cursors[0]
      assert.equal(visitCursor.count(), 1)
    })
  })


  function createTestVisit(visit) {
    Visits.insert(visit)
  }

  function getTomorrowDate() {
    var tomorrow = new Date()
    tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000))
    return tomorrow
  }

  function getYesterdayDate() {
    var yesterday = new Date()
    yesterday.setTime(yesterday.getTime() - ( 24 * 60 * 60 * 1000))
    return yesterday
  }


  function insertTestVisits(requesterId, agencyId, agency2Id, userId) {
    createTestVisit(TestVisits.createFutureBostonNonScheduledVisit(requesterId, agencyId))
    createTestVisit(TestVisits.createPastBostonNonScheduledVisit(requesterId, agencyId))
    createTestVisit(TestVisits.createPastBostonVisitRequesterFeedback(requesterId, agencyId, userId))
    createTestVisit(TestVisits.createFutureScheduledBostonVisit(requesterId, agencyId, userId))
    createTestVisit(TestVisits.createFutureBostonNonScheduledVisit(requesterId, agency2Id))
    createTestVisit(TestVisits.createPastBostonVisitRequesterFeedbackVisitorFeedback(requesterId, agencyId, userId))
  }
}