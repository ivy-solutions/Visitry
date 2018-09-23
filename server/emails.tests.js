/**
 * Created by Daniel Biales on 2/17/17.
 */
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert,expect,fail } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/server/emails.js';
import StubPackage from 'meteor/hwillson:stub-collections';
const StubCollections = StubPackage.default
import {Roles} from 'meteor/alanning:roles'
import {Agencies} from '/model/agencies';

describe('emails', ()=> {
  let testUserId;
  let testUser={
    username: 'testUserWithEmail',
    password: 'Visitry99',
    role: "requester",
    emails: [{address:'email@address.com'}]
  };
  beforeEach(()=> {
    StubCollections.stub(Meteor.users);
    testUserId = Meteor.users.insert(testUser);
  });

  afterEach(()=> {
    StubCollections.restore();
  });

  describe('emails.sendEnrollmentEmail', ()=> {
    const sendEnrollmentEmailHandler = Meteor.server.method_handlers['sendEnrollmentEmail'];
    let accountsSendEnrollmentEmailStub;

    const agencyId = Random.id();
    beforeEach(()=> {
      accountsSendEnrollmentEmailStub = sinon.stub(Accounts, 'sendEnrollmentEmail', ()=> true);
    });
    afterEach(()=> {
      Accounts.sendEnrollmentEmail.restore();
    });

    it('fails if user is not an administrator', ()=> {
      const invocation = {userId: testUserId};
      assert.throws(()=>sendEnrollmentEmailHandler.apply(invocation, [testUserId, agencyId]),
        'Must be an agency administrator to send enrollment email. [unauthorized]');
    });
    it('fails if user is an administrator but not for this agency', ()=> {
      const invocation = {userId: testUserId};
      Roles.addUsersToRoles(testUserId, ['administrator'], 'anotherAgency');
      assert.throws(()=>sendEnrollmentEmailHandler.apply(invocation, [testUserId, agencyId]),
        'Must be an agency administrator to send enrollment email. [unauthorized]');
    });
    it('Accounts.sendEnrollmentEmail is called', ()=> {
      const invocation = {userId: testUserId};
      Roles.addUsersToRoles(testUserId, ['administrator'], agencyId);
      sendEnrollmentEmailHandler.apply(invocation, [testUserId, agencyId]);
      assert(accountsSendEnrollmentEmailStub.calledOnce);
    });

  });

  describe('emails.sendAgencyWelcomeEmail', ()=> {
    const sendAgencyWelcomeEmail = Meteor.server.method_handlers['sendAgencyWelcomeEmail'];
    let emailSpy;
    let agencyId;
    let agency = {
      name: 'test-agency',
      contactEmail: 'agency@email.com',
      contactPhone: '0000000000',
      website: 'http://blank.com',
      location: {address: 'here'}
    };

    beforeEach(()=> {
      StubCollections.stub('agencies');
      agencyId = Agencies.insert(agency);
      emailSpy = sinon.spy(Email, 'send');
    });

    afterEach(()=> {
      Email.send.restore();
    });

    it('Welcome email is sent with all the correct values',()=>{
      const invocation = {userId: testUserId};
      sendAgencyWelcomeEmail.apply(invocation,[testUserId,agencyId]);
      let emailArgs = emailSpy.args[0][0];
      assert.equal(emailArgs.to,testUser.emails[0].address);
      assert.equal(emailArgs.from,'Visitry Admin <admin@visitry.org>');
      assert.equal(emailArgs.subject,'Visitry: Welcome to ' + agency.name);
    });
  });
});

