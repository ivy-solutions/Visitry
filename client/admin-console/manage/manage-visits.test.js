/**
 * Created by n0235626 on 1/9/17.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/admin-console/manage/manage-visits.controller';

describe('Admin Manage Visits', function () {

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

  beforeEach(function () {
    inject(function ($rootScope, $state) {
      scope = $rootScope.$new(true);
      controller = $controller('adminManageVisitsCtrl', {$scope: scope, $state: $state});
    });
  });

  afterEach(function () {
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
    }
  )
});
