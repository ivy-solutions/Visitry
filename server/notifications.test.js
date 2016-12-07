/**
 * Created by sarahcoletti on 12/7/16.
 */
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert,expect,fail,to } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { Notifications,Notification } from '/model/notifications'
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
          Notifications.remove({}, function(err) { if (err) console.log(err); })
          findOneUserStub.returns({fullname: "Alphonso Morris"})
        });
        it('creates 3 notification records', () => {
          const invocation = {userId: userId};
          handler.apply(invocation, [visitorVisit]);
          assert.equal(Notifications.find().count(), 3);
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
