/**
 * Created by sarahcoletti on 12/7/16.
 */
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert,expect,fail,to } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { Notifications,Notification, NotificationStatus } from '/model/notifications'
import { Agency} from '/model/agencies'
import '/server/notifications.js';

if (Meteor.isServer) {

    describe('Notifications', () => {
      var userId, otherUserId;
      var visitorVisit, requesterVisit;
      var meteorStub;
      var findOneAgencyStub, findOneUserStub;
      var agencyId, visitId;

      beforeEach(() => {
        userId = Random.id();
        otherUserId = Random.id();
        agencyId = Random.id();
        visitId = Random.id();
        meteorStub = sinon.stub(Meteor, 'call');
        findOneAgencyStub = sinon.stub(Agency, 'findOne');
        findOneUserStub = sinon.stub(User, 'findOne');

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
      });
      afterEach(function () {
        Agency.findOne.restore();
        User.findOne.restore();
        meteorStub.restore();
      });


      describe('notifications.visitScheduled method', () => {
        const handler = Meteor.server.method_handlers['notifications.visitScheduled'];
        beforeEach(function() {
          Notifications.remove({});
          findOneUserStub.returns({fullname: "Alphonso Morris"});
          addFutureNotificationTask = function(id){};
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
      });

      describe('formattedVisitTime ', () => {

        it('formatted visitTime with no time zone defaults to EST', () => {
          var dateAt330pmUTC = Date.UTC(2016, 9, 1, 15, 30, 0, 0);
          var visit = {visitTime: dateAt330pmUTC};
          assert.equal(formattedVisitTime(visit), "Oct. 1, 11:30");
        });
        it('formatted visitTime with agency time zone = PST', () => {
          findOneAgencyStub.returns({timeZone: 'America/Los_Angeles'})
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
