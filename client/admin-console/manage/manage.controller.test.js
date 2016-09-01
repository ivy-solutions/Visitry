/**
 * Created by n0235626 on 8/30/16.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/admin-console/manage/manage.controller';

describe('Admin Manage', function () {

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
    inject(function ($rootScope) {
      scope = $rootScope.$new(true);
      controller = $controller('adminManageCtrl', {$scope: scope});
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
  })

});