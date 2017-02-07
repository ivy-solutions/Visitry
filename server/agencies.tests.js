import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert,expect,fail } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import StubCollections from 'meteor/hwillson:stub-collections';

import {Agencies, Agency} from '/model/agencies'
import '/server/agencies.js';


if (Meteor.isServer) {
  const userId = Random.id();

  describe('Agencies', () => {

    describe('validation', () => {
      var invalidAgency;
      beforeEach(function () {
        invalidAgency = new Agency();
        invalidAgency.name = "a"; //too short
        invalidAgency.website = "noDots"; //bad format
        invalidAgency.contactEmail = "noAtSign";// bad format
      });

      it('fails if name is too short', () => {
        invalidAgency.validate({fields: ['name']}, function (err, id) {
          assert.equal(err.error, 'validation-error');
          assert.equal(err.reason, 'Length of "name" has to be at least 3');
        });
      });
      it('fails if website has a bad format', () => {
        invalidAgency.validate({fields: ['website']}, function (err, id) {
          assert.equal(err.reason, '"website" should be a valid URL');
          assert.equal(err.error, 'validation-error');
        });
      });
      it('fails if contactEmail has a bad format', () => {
        invalidAgency.validate({fields: ['contactEmail']}, function (err, id) {
          assert.equal(err.reason, '"contactEmail" should be a valid email address');
          assert.equal(err.error, 'validation-error');
        });
      });
      it('fails missing required field: location ', () => {
        invalidAgency.validate({fields: ['location']}, function (err, id) {
          assert.equal(err.reason, '"location" is required');
          assert.equal(err.error, 'validation-error');
        });
      });
      it('fails missing required field: contactPhone ', () => {
        invalidAgency.validate({fields: ['contactPhone']}, function (err, id) {
          assert.equal(err.reason, '"contactPhone" is required');
          assert.equal(err.error, 'validation-error');
        });
      });
      it('fails if contactPhone has bad format', ()=> {
        invalidAgency.contactPhone = '324 8239 485';
        invalidAgency.validate({fields: ['contactPhone']}, function (err, id) {
          assert.equal(err.reason, 'Phone number format should be (nnn) nnn-nnnn');
          assert.equal(err.error, 'validation-error');
        });
      });
      it('fails missing required field: contactEmail ', () => {
        invalidAgency.contactEmail = null;
        invalidAgency.validate({fields: ['contactEmail']}, function (err, id) {
          assert.equal(err.reason, '"contactEmail" is required');
          assert.equal(err.error, 'validation-error');
        });
      });
      it('passes validation if all fields are valid ', () => {
        var validAgency = new Agency();
        validAgency.name = "Good Agency";
        validAgency.description = "description";
        validAgency.website = "http://www.goodwebsite.com";
        validAgency.location = {
          address: "80 Willow Street, Acton, MA 01720",
          formattedAddress: "80 Willow St, Acton, MA 01720",
          geo: {
            "type": "Point",
            "coordinates": [-71.477358, 42.468846]
          }
        };
        validAgency.activeUntil = new Date();
        validAgency.administratorId = "anID";
        validAgency.contactEmail = "someOne@agency.com";
        validAgency.contactPhone = '(800) 555-1212';
        //Note: we do save rather than validate here so the behaviors will be invoked and provide the createdAt fieldmeteo
        validAgency.save(function (err, id) {
          assert.isUndefined(err, "expected 0 errors:" + (err ? err.reason : ""));
        });
      });

    });
  });

  describe('agencies.sendJoinRequest', () => {
    var testUserId = Random.id();
    var testAgencyId = Random.id();
    var meteorStub;
    var findAgencyStub;
    var findUserStub;
    const sendEmailSpy = sinon.spy(Email, 'send');

    beforeEach(() => {
      findAgencyStub = sinon.stub(Agency, 'findOne');
      findAgencyStub.returns({name: 'Friendly Visitor Agency', contactEmail: 'someone@somewhere.com'});
      findUserStub = sinon.stub(User, 'findOne');
      findUserStub.returns({
        username: 'Louisa', fullName: 'Louisa Jones',
        emails: [{address: 'abc@someplace.com', verified: false}],
      });
      meteorStub = sinon.stub(Meteor, 'call');
    });
    afterEach(() => {
      Agency.findOne.restore();
      User.findOne.restore();
      meteorStub.restore();
      sendEmailSpy.restore();
    });

    const sendJoinRequest = Meteor.server.method_handlers['sendJoinRequest'];

    it('updates user when request to join agency made', function(done) {
      const invocation = {userId: testUserId};
      sendJoinRequest.apply(invocation, [testAgencyId, "Please let me join."]);
      assert(Meteor.call.calledWith('addProspectiveAgency'), "addProspectiveAgency called");
      done();
    });

    it('sends email when request to join agency made', function(done) {
      const invocation = {userId: testUserId};
      sendJoinRequest.apply(invocation, [testAgencyId, "Please let me join."]);
      sinon.assert.calledOnce(sendEmailSpy);
      done();
    });
  });

  describe('updateAgency', ()=> {
    const updateAgency = Meteor.server.method_handlers['updateAgency'];
    let agencyId;
    let adminUserId;
    let nonAdminUserId;
    beforeEach(()=> {
      StubCollections.stub(Agencies);
      agencyId = Agencies.insert({name: 'testAgency', createdAt: new Date()});
      StubCollections.stub(Meteor.users);
      adminUserId = Meteor.users.insert({
        username: 'adminTestUser',
        password: 'password',
        roles: ['administrator']
      });
      nonAdminUserId = Meteor.users.insert({
        username: 'nonAdminTestUser',
        password: 'password',
        roles: ['requester']
      });
    });
    afterEach(()=> {
      StubCollections.restore();
    });
    it('fails if user is not logged in', ()=> {
      const invocation = {userId: null};
      let newName = 'testAgencyNewName';
      assert.throws(()=>updateAgency.apply(invocation, [agencyId, {name: newName}]),'Must be logged in to update agency. [not-logged-in]');
      let agency = Agencies.findOne({_id: agencyId});
      assert.notEqual(agency.name, newName);
    });
    it('fails if user is not administrator', ()=> {
      const invocation = {userId: nonAdminUserId};
      let newName = 'testAgencyNewName';
      assert.throws(()=>updateAgency.apply(invocation, [agencyId, {name: newName}]),'User must be an administrator to update agency. [unauthorized]');
      let agency = Agencies.findOne({_id: agencyId});
      assert.notEqual(agency.name, newName);
    });
    it('it updates the agency', ()=> {
      const invocation = {userId: adminUserId};
      let newName = 'testAgencyNewName';
      updateAgency.apply(invocation, [agencyId, {name: newName}]);
      let agency = Agencies.findOne({_id: agencyId});
      assert.equal(agency.name, newName);
    });
    it('it tries to create a new agency when no agency Id passed', ()=> {
      const invocation = {userId: adminUserId};
      assert.throws(()=>updateAgency.apply(invocation, [ null, {name:"Fun for Fogies"}]), '"location" is required [validation-error]');
    });

  })
}