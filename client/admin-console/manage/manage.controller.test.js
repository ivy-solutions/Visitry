/**
 * Created by Daniel Biales on 8/30/16.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {assert} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/admin-console/manage/manage.controller';
import { Random } from 'meteor/random';

describe('Admin Manage', function () {

  beforeEach(()=> {
    angular.mock.module('visitry');
  });

  let controller;
  let AdminVisitDetailsDialogMock = {
    open: (visitId)=> {
      return visitId;
    }
  };
  let UserDetailsDialogMock = {
    open: (userId)=>{
      return userId;
    }
  };
  let ChooseAgencyDialogMock = {
    open:(closeFunction)=> {}
  };

  beforeEach(inject(function (_$controller_, _$cookies_, $rootScope) {
    controller = _$controller_('adminManageCtrl', {$scope: $rootScope.$new(true),
      AdminVisitDetailsDialog:AdminVisitDetailsDialogMock,UserDetailsDialog:UserDetailsDialogMock, ChooseAgencyDialog:ChooseAgencyDialogMock});
    $cookies = _$cookies_;
  }));

  afterEach(()=> {
  });

  describe('AgencyId Cookie', () => {
    beforeEach(()=> {
      $cookies.put('agencyId', Random.id())
    });
    afterEach(()=> {
      $cookies.remove('agencyId');
    });
    it('agencyId cookie is not null', function () {
      assert.isNotNull(controller.agencyId);
    });
  });

  describe('confirm user calls addUserToAgency', ()=> {
    let meteorCallSpy;
    beforeEach(()=> {
      meteorCallSpy = sinon.spy(Meteor, 'call');
    });
    afterEach(()=> {
      meteorCallSpy.reset();
      Meteor.call.restore();
    });
    it('confirm user calls addUserToAgency', ()=> {
      controller.confirmUser('userId');
      assert.isTrue(meteorCallSpy.calledWith('addUserToAgency'));
    });
  });

  describe('getVisitDetails', ()=> {
    let AdminVisitDetailsDialogSpy;
    beforeEach(()=> {
      AdminVisitDetailsDialogSpy = sinon.spy(AdminVisitDetailsDialogMock, 'open');
    });
    afterEach(()=> {
      AdminVisitDetailsDialogMock.open.restore();
    });
    it('getVisitDetails opens AdminVisitDetailsDialog', ()=> {
      let visitId = Random.id();
      controller.getVisitDetails(visitId);
      assert(AdminVisitDetailsDialogSpy.calledWith(visitId));
    });
  });

  describe('getUserDetails', ()=> {
    let UserDetailsDialogSpy;
    beforeEach(()=> {
      UserDetailsDialogSpy = sinon.spy(UserDetailsDialogMock, 'open');
    });
    afterEach(()=> {
      UserDetailsDialogMock.open.restore();
    });
    it('getVisitDetails opens AdminVisitDetailsDialog', ()=> {
      let userId = Random.id();
      controller.getUserDetails(userId);
      assert(UserDetailsDialogSpy.calledWith(userId));
    });
  });

  describe('switchAgency', ()=> {
    let ChooseAgencyDialogSpy;
    beforeEach(()=> {
      ChooseAgencyDialogSpy = sinon.spy(ChooseAgencyDialogMock, 'open');
    });
    afterEach(()=> {
      ChooseAgencyDialogMock.open.restore();
    });
    it('switchAgency opens ChooseAgencyDialog', ()=> {
       controller.switchAgency();
      assert.isTrue(ChooseAgencyDialogSpy.calledOnce);
    });
  });

  describe('updateAgencyCookie', () => {
    beforeEach(()=> {
      $cookies.put('agencyId', 'oldCookie')
    });
    afterEach(()=> {
      $cookies.remove('agencyId');
    });
    it('agencyId cookie is unchanged', function () {
      controller.updateAgencyCookie();
      assert.equal('oldCookie',controller.agencyId);
    });
    it('agencyId cookie is updated', function () {
      $cookies.put('agencyId', 'newCookie')
      controller.updateAgencyCookie();
      assert.equal('newCookie',controller.agencyId);
    });
  });

});