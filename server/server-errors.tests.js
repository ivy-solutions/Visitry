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
    let agencyId = Random.id();
    beforeEach(()=> {
      let rolesUserIsInRoleStub = sinon.stub(Roles, 'userIsInRole');
      rolesUserIsInRoleStub.withArgs('admin').returns(true);
      rolesUserIsInRoleStub.withArgs('not-admin').returns(false);
      rolesUserIsInRoleStub.withArgs('super-user', ['administrator'], 'allAgencies').returns(true);
    });
    afterEach(()=> {
      Roles.userIsInRole.restore();
    });
    it('if user is an administrator', ()=> {
      assert.doesNotThrow(()=>Errors.checkUserIsAdministrator('admin', agencyId, 'testCheckUserIsAdmin', 'Error Message'), /.*/);
    });

    it('if user is not an administrator', ()=> {
      assert.throws(()=>Errors.checkUserIsAdministrator('not-admin', agencyId, 'testCheckUserIsAdmin', 'Error Message'), 'unauthorized', 'Error Message');
    });
    it('if user is super-user', ()=> {
      assert.doesNotThrow(()=>Errors.checkUserIsAdministrator('super-user', agencyId, 'testCheckUserIsAdmin', 'Error Message'), /.*/);
    });
  });


});