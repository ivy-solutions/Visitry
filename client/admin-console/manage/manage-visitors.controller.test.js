/**
 * Created by n0235626 on 12/28/16.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {assert} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { Random } from 'meteor/random';
import '/client/admin-console/manage/manage-visitors.controller';

describe('Admin Manage Visitors', function () {

  beforeEach(function () {
    angular.mock.module('visitry');
  });

  beforeEach(inject(function (_$controller_, _$cookies_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
    $cookies = _$cookies_;
  }));

  var controller;
  var scope;
  var stateSpy;
  let UserDetailDialogMock = {
    open: (userId)=> {
      return userId;
    }
  };

  beforeEach(function () {
    inject(function ($rootScope, $state) {
      scope = $rootScope.$new(true);
      controller = $controller('adminManageVisitorsCtrl', {$scope: scope, $state: $state,UserDetailsDialog:UserDetailDialogMock});
      stateSpy = sinon.stub($state, 'go');
    });
  });

  afterEach(function () {
    stateSpy.reset();
    stateSpy.restore();
  });

  describe('AgencyId Cookie', function () {
    beforeEach(function () {
      $cookies.put('agencyId', Random.id())
    });
    afterEach(function () {
      $cookies.remove('agencyId');
    });
    it('agencyId cookie is not null', function () {
      assert.isNotNull(controller.agencyId);
    })
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

  describe('addUser', function () {
    it('navigate to the register screen', ()=> {
      controller.addUser();
      assert(stateSpy.withArgs('register', {role: "visitor"}).calledOnce);
    });
  });

  describe('open userDetailsDialog', ()=> {
    let userDetailsDialogSpy;
    let userId;
    beforeEach(()=>{
      userDetailsDialogSpy = sinon.spy(UserDetailDialogMock,'open');
      userId = Random.id();
    });
    afterEach(()=>{
      userDetailsDialogSpy.reset();
      UserDetailDialogMock.open.restore();
    });
    it('can call open on UserDetailsDialog with a userId', ()=> {
      controller.getUserDetails(userId);
      assert(userDetailsDialogSpy.returned(userId));
    });
  });

});