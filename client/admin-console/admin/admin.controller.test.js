/**
 * Created by n0235626 on 8/30/16.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/admin-console/admin/admin.controller';

describe('Admin Admin', function () {

  beforeEach(function () {
    angular.mock.module('visitry');
  });

  beforeEach(inject(function (_$controller_, _$cookies_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  var controller;
  var scope;

  beforeEach(function () {
    inject(function ($rootScope) {
      scope = $rootScope.$new(true);
      controller = $controller('adminAdminCtrl', {$scope: scope});
    });
  });

  afterEach(function () {
  });
});