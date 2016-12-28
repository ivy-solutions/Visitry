/**
 * Created by n0235626 on 12/28/16.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
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

  beforeEach(function () {
    inject(function ($rootScope, $state) {
      scope = $rootScope.$new(true);
      controller = $controller('adminManageVisitorsCtrl', {$scope: scope, $state: $state});
      stateSpy = sinon.stub($state, 'go');
    });
  });

  afterEach(function () {
  });

  describe('AgencyId Cookie', function () {
    beforeEach(function () {
      $cookies.put('agencyId', Random.id)
    });
    afterEach(function () {
      $cookies.remove('agencyId');
    });
    it('agencyId cookie is not null', function () {
      chai.assert.isNotNull(controller.agencyId);
    })
  });

  describe('pageChanged', function () {
    it('changing the page changes the page variable', ()=> {
      controller.pageChanged(1);
      chai.assert.equal(controller.page, 1);
    });
  });

  describe('toggleSort', function () {
    it('change the toggle changes the sort variable', ()=> {
      controller.toggleSort('userData.firstName');
      chai.assert.equal(controller.sort['userData.firstName'], -1);
    });
  });

  describe('addUser', function () {
    it('navigate to the register screen', ()=> {
      controller.addUser();
      chai.assert(stateSpy.withArgs('register', {role: "visitor"}).calledOnce);
    });
  });

});