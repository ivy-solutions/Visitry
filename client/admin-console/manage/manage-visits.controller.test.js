/**
 * Created by n0235626 on 1/9/17.
 */
import 'angular-mocks';
import {assert} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/admin-console/manage/manage-visits.controller';

describe('Admin Manage Visits', function () {

  beforeEach(function () {
    angular.mock.module('visitry');
  });

  let controller;
  let AdminVisitDetailsDialogMock = {
    open: (visitId)=>visitId
  }

  beforeEach(inject(function (_$controller_, _$cookies_, $rootScope) {
    controller = _$controller_('adminManageVisitsCtrl', {
      $scope: $rootScope.$new(true),
      AdminVisitDetailsDialog: AdminVisitDetailsDialogMock
    });
    $cookies = _$cookies_;
  }));

  afterEach(function () {
  });

  describe('pageChanged', function () {
    it('changing the page changes the page variable', ()=> {
      controller.pageChanged(1);
      assert.equal(controller.page, 1);
    });
  });

  describe('toggleSort', function () {
    it('change the toggle changes the sort variable', ()=> {
      controller.toggleSort('userData.firstName');
      assert.equal(controller.sort['userData.firstName'], -1);
    });
  });

  describe('AgencyId Cookie', () => {
    beforeEach(()=> {
      $cookies.put('agencyId', Random.id());
    });
    afterEach(()=> {
      $cookies.remove('agencyId');
    });
    it('agencyId cookie is not null', ()=> {
      assert.isNotNull(controller.agencyId);
    });
  });

  describe('getVisitDetails',()=>{
    let adminVisitDetailsDialogSpy;
    beforeEach(()=>{
      adminVisitDetailsDialogSpy = sinon.spy(AdminVisitDetailsDialogMock,'open');
    });
    afterEach(()=>{
      AdminVisitDetailsDialogMock.open.restore();
    });
    it('getVisitDetails called with visitId',()=>{
      let visitId = Random.id();
      controller.getVisitDetails(visitId);
      assert(adminVisitDetailsDialogSpy.calledWith(visitId));
    });
  })
})
;
