/**
 * Created by Daniel Biales on 2/17/17.
 */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import {Roles} from 'meteor/alanning:roles'
import {Errors} from '/server/server-errors.js';

describe('server-errors', ()=> {

  describe('Errors.checkUserLoggedIn', ()=> {
    it('if user is logged in does not throw error', ()=> {
      assert.doesNotThrow(()=>Errors.checkUserLoggedIn(Random.id(), 'testCheckUserLoggedIn', 'Error Message'), /.*/);
    });

    it('if user is not logged in throws error', ()=> {
      assert.throws(()=>Errors.checkUserLoggedIn(null, 'testCheckUserLoggedIn', 'Error Message'), 'not-logged-in', 'Error Message');
    });
  });

  describe('Errors.checkUserIsAdministrator', ()=> {
    beforeEach(()=> {
      let rolesUserIsInRoleStub = sinon.stub(Roles, 'userIsInRole');
      rolesUserIsInRoleStub.withArgs('admin').returns(true);
      rolesUserIsInRoleStub.withArgs('not-admin').returns(false);
    });
    afterEach(()=> {
      Roles.userIsInRole.restore();
    });
    it('if user is logged in does not throw error', ()=> {
      assert.doesNotThrow(()=>Errors.checkUserIsAdministrator('admin', 'testCheckUserLoggedIn', 'Error Message'), /.*/);
    });

    it('if user is not logged in throws error', ()=> {
      assert.throws(()=>Errors.checkUserIsAdministrator('not-admin', 'testCheckUserLoggedIn', 'Error Message'), 'unauthorized', 'Error Message');
    });
  });


});