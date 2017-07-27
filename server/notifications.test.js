/**
 * Created by sarahcoletti on 12/7/16.
 */
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert,expect,fail,to } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { Notifications,Notification, NotificationStatus } from '/model/notifications';
import { Agency} from '/model/agencies';
import { Feedback} from '/model/feedback';
import { Visit} from '/model/visits';
import '/server/notifications.js';

if (Meteor.isServer) {

    describe('Notifications', () => {
      let userId, otherUserId, adminId;
      let visitorVisit, requesterVisit, unscheduledVisit;
      let meteorStub;
      let findOneAgencyStub, findOneUserStub, rolesUserIsInRoleStub;
      let agencyId, visitId;

      beforeEach(() => {
        userId = Random.id();
        otherUserId = Random.id();
        adminId = Random.id();
        agencyId = Random.id();
        visitId = Random.id();
        meteorStub = sinon.stub(Meteor, 'call');
        findOneAgencyStub = sinon.stub(Agency, 'findOne');
        findOneUserStub = sinon.stub(User, 'findOne');
        rolesUserIsInRoleStub = sinon.stub(Roles,'userIsInRole').withArgs(adminId,'administrator',agencyId).returns(true);

        visitorVisit = {
          _id: visitId,
          notes: 'test userId is visitor',
          requestedDate: getTomorrowDate(),
          createdAt: new Date(),
          requesterId: otherUserId,
          visitorId: userId,
          visitTime: getTomorrowDate(),
          agencyId: agencyId
        };
        requesterVisit = {
          _id: visitId,
          notes: 'test userId is requester',
          requestedDate: getTomorrowDate(),
          createdAt: new Date(),
          requesterId: userId,
          visitorId: otherUserId,
          visitTime: getTomorrowDate(),
          agencyId: agencyId
        };
        unscheduledVisit = {
          _id: visitId,
          notes: 'test userId is visitor',
          requestedDate: getTomorrowDate(),
          createdAt: new Date(),
          requesterId: otherUserId,
          agencyId: agencyId
        }
      });
      afterEach(function () {
        Agency.findOne.restore();
        User.findOne.restore();
        meteorStub.restore();
        Roles.userIsInRole.restore();
      });


      describe('notifications.visitScheduled method', () => {
        const handler = Meteor.server.method_handlers['notifications.visitScheduled'];
        beforeEach(function() {
          Notifications.remove({});
          findOneUserStub.returns({fullname: "Alphonso Morris"});
        });
        it('creates 3 notification records', () => {
          const invocation = {userId: userId};
          handler.apply(invocation, [visitorVisit]);
          assert.equal(Notifications.find({status: NotificationStatus.SENT}).count(), 1); //notification sent to requester
          assert.equal(Notifications.find({status: NotificationStatus.FUTURE}).count(), 2); // notification to visitor/requester on day of visit
        });
        it('sends a push notification', () => {
          const invocation = {userId: userId};
          handler.apply(invocation, [visitorVisit]);
          assert.isTrue(Meteor.call.calledWith('userNotification'),"userNotification called");
        });
      });

      describe('notifications.visitCreatedByAdmin method',() =>{
        const handler = Meteor.server.method_handlers['notifications.visitCreatedByAdmin'];
        beforeEach(()=>{
          Notifications.remove({});
          findOneUserStub.returns({fullName:'admin 1'})
        })
        it('creates 1 notification record',()=>{
          const invocation = {userId: adminId}
          handler.apply(invocation,[requesterVisit]);
          assert.equal(Notifications.find({status: NotificationStatus.SENT}).count(), 1)
        });
        it('sends a push notification', () => {
          const invocation = {userId: adminId};
          handler.apply(invocation, [requesterVisit]);
          assert.isTrue(Meteor.call.calledWith('userNotification'),"userNotification called");
        });
      })

      describe('notifications.visitCancelled method', () => {
        const handler = Meteor.server.method_handlers['notifications.visitCancelled'];
        beforeEach(function() {
          Notifications.remove({});
          var futureNotificationParty1 = new Notification({
              visitId: visitId,
              notifyDate: new Date(), toUserId: userId, status: NotificationStatus.FUTURE,
              title: "Visit today", text: "FutureNotification1, "
            }
          ).save();
          var futureNotificationPart2 = new Notification({
              visitId: visitId,
              notifyDate: new Date(), toUserId: otherUserId, status: NotificationStatus.FUTURE,
              title: "Visit today", text: "FutureNotification2, "
            }
          ).save();
          findOneUserStub.returns({fullname: "Alice Morris", userData: {firstName: "Alice", lastName: "Morris"}});
        });
        it("cancel by requester sends notification and removes future notifications", () => {
          const invocation = {userId: userId};
          handler.apply(invocation, [requesterVisit]);
          assert.equal(Notifications.find({status: NotificationStatus.SENT}).count(), 1);
          assert.equal(Notifications.find({status: NotificationStatus.FUTURE}).count(), 0);
        });
        it('cancel by requester sends push notification to visitor', () => {
          const invocation = {userId: userId};
          handler.apply(invocation, [requesterVisit]);
          assert.isTrue(Meteor.call.calledWith('userNotification'),"userNotification called");
        });
        it("cancel by visitor sends notification and removes future notifications", () => {
          const invocation = {userId: userId};
          handler.apply(invocation, [visitorVisit]);
          assert.equal(Notifications.find({status: NotificationStatus.SENT}).count(), 1);
          assert.equal(Notifications.find({status: NotificationStatus.FUTURE}).count(), 0);
        });
        it('cancel by requester sends push notification to visitor', () => {
          const invocation = {userId: userId};
          handler.apply(invocation, [visitorVisit]);
          assert.isTrue(Meteor.call.calledWith('userNotification'),"userNotification called");
        });
        it('cancel by admin sends push notification to visitor and requester',()=>{
          const invocation = {userId: adminId};
          handler.apply(invocation, [visitorVisit]);
          assert.isTrue(Meteor.call.calledWith('userNotification',sinon.match(/.*/),sinon.match(/.*/),visitorVisit.visitorId),"userNotification called");
          assert.isTrue(Meteor.call.calledWith('userNotification',sinon.match(/.*/),sinon.match(/.*/),visitorVisit.requesterId),"userNotification called");
        });
        it("cancel by admin sends notification and removes future notifications", () => {
          const invocation = {userId: adminId};
          handler.apply(invocation, [visitorVisit]);
          assert.equal(Notifications.find({status: NotificationStatus.SENT}).count(), 2);
          assert.equal(Notifications.find({status: NotificationStatus.FUTURE}).count(), 0);
        });
        it('cancel by admin sends one push notification if visitor hasn\'t accepted the visit',()=>{
          const invocation = {userId: adminId};
          handler.apply(invocation, [unscheduledVisit]);
          assert.isTrue(Meteor.call.calledWith('userNotification',sinon.match(/.*/),sinon.match(/.*/),visitorVisit.requesterId),"userNotification called");
          assert.isTrue(Meteor.call.calledOnce);
        });
      });

      describe('notifications.agencyEnrolled', () => {
        const handler = Meteor.server.method_handlers['notifications.agencyEnrolled'];
        beforeEach(function() {
          Notifications.remove({});
          findOneAgencyStub.returns({name: "Test Agency"});
        });
        it('creates a notification records', () => {
          const invocation = {userId: userId};
          handler.apply(invocation, [otherUserId, {name: "Test Agency"}]);
          assert.equal(Notifications.find({status: NotificationStatus.SENT}).count(), 1); //notification sent to requester
        });
        it('sends a push notification', () => {
          const invocation = {userId: userId};
          handler.apply(invocation, [otherUserId, {name: "Test Agency"}]);
          assert.isTrue(Meteor.call.calledWith('userNotification'),"userNotification called");
        });

      });

      describe('notifications.newVisitRequest', () => {
        const handler = Meteor.server.method_handlers['notifications.newVisitRequest'];
        let findFeedbackStub;
        beforeEach(function() {
          Notifications.remove({});
          findOneUserStub.returns({fullname: "Sylvia Dolittle"});
          findFeedbackStub = sinon.stub(Feedback, 'find');
          findFeedbackStub.returns([]);
         });
        afterEach(function () {
          findFeedbackStub.restore();
        });
        it('finds no previous feedback so sends no notification', () => {
          const invocation = {userId: otherUserId};
          handler.apply(invocation, [requesterVisit]);
          assert.equal(Notifications.find({status: NotificationStatus.SENT}).count(), 0); //no notification sent to favorite visitor
        });
        it('finds previous feedback so sends 1 notifiation', () => {
          findFeedbackStub.returns([{visitorId: otherUserId}]);
          const invocation = {userId: userId};
          handler.apply(invocation, [requesterVisit]);
          assert.equal(Notifications.find({status: NotificationStatus.SENT}).count(), 1);
        });
        it('finds multiple previous feedback from one user sends 1 notifiation', () => {
          findFeedbackStub.returns([{visitorId: otherUserId}, {visitorId: otherUserId}, {visitorId: otherUserId}]);
          const invocation = {userId: userId};
          handler.apply(invocation, [requesterVisit]);
          assert.equal(Notifications.find({status: NotificationStatus.SENT}).count(), 1);
        });
      });

      describe('notifications.feedbackReminders', () => {
        const handler = Meteor.server.method_handlers['notifications.feedbackReminders'];
        let findVisitStub;
        beforeEach(function() {
          Notifications.remove({});
          findVisitStub = sinon.stub(Visit, 'find');
          findVisitStub.returns([]);
        });
        afterEach(function () {
          findVisitStub.restore();
        });
        it('finds no visits needing feedback so sends no notification', () => {
          const invocation = {userId: userId};
          handler.apply(invocation);
          assert.equal(Notifications.find({status: NotificationStatus.SENT}).count(), 0);
        });
        it('finds one visit needing requester and visitor feedback so sends 2 notifications', () => {
          const invocation = {userId: userId};
          findVisitStub.returns([visitorVisit]);
          handler.apply(invocation);
          assert.equal(Notifications.find({status: NotificationStatus.SENT}).count(), 2);
        });
        it('finds one visit needing requester feedback so sends 1 notifications', () => {
          const invocation = {userId: userId};
          findVisitStub.returns([{visitorFeedbackId: Random.id(), requesterId: otherUserId}]);
          handler.apply(invocation);
          assert.equal(Notifications.find({status: NotificationStatus.SENT}).count(), 1);
        });
        it('finds one visit needing visitor feedback so sends 1 notifications', () => {
          const invocation = {userId: userId};
          findVisitStub.returns([{requesterFeedbackId: Random.id(), requesterId: otherUserId, visitorId:userId}]);
          handler.apply(invocation);
          assert.equal(Notifications.find({status: NotificationStatus.SENT}).count(), 1);
        });
      });

      describe('notifications.useAppReminder', () => {
        const handler = Meteor.server.method_handlers['notifications.useAppReminder'];
        let findVisitStub;
        let findUserStub;
        beforeEach(function() {
          Notifications.remove({});
          findVisitStub = sinon.stub(Visit, 'find');
          findVisitStub.returns([{notes: 'SomePendingRequest', agencyId: agencyId }]);
          findOneAgencyStub.returns( {name: 'Test Agency'});
          findUserStub = sinon.stub(User, 'find');
          findUserStub.returns([]);
        });
        afterEach(function () {
          findVisitStub.restore();
          findUserStub.restore();
        });
        it('finds no inactive users so sends no notification', () => {
          const invocation = {userId: userId};
          handler.apply(invocation);
          assert.equal(Notifications.find({status: NotificationStatus.SENT}).count(), 0);
        });
        it('finds 2 inactive users so sends 2 notifications', () => {
          const invocation = {userId: userId};
          findUserStub.returns([{_id:userId},{_id:otherUserId}]);
          handler.apply(invocation);
          assert.equal(Notifications.find({status: NotificationStatus.SENT}).count(), 2);
        });
        it('finds no agency with pending requests so sends no notification', () => {
          const invocation = {userId: userId};
          findVisitStub.returns([]);
          handler.apply(invocation);
          assert.equal(Notifications.find({status: NotificationStatus.SENT}).count(), 0);
        });

      });

      describe('formattedVisitTime ', () => {

        it('formatted visitTime with no time zone defaults to EST', () => {
          var dateAt330pmUTC = Date.UTC(2016, 9, 1, 15, 30, 0, 0);
          var visit = {visitTime: dateAt330pmUTC};
          assert.equal(formattedVisitTime(visit), "Oct. 1, 11:30");
        });
        it('formatted visitTime with agency time zone = PST', () => {
          findOneAgencyStub.returns({timezone: 'America/Los_Angeles'})
          var dateAt330pmUTC = Date.UTC(2016, 9, 1, 15, 30, 0, 0);
          var visit = {visitTime: dateAt330pmUTC};
          assert.equal(formattedVisitTime(visit), "Oct. 1, 8:30");
        });
    });
  })
}
function getTomorrowDate() {
  var tomorrow = new Date();
  tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));
  return tomorrow;
}
