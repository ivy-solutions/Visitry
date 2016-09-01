/**
 * Created by n0235626 on 8/31/16.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/admin-console/manage/manage-seniors.controller';

describe('Admin Manage Seniors', function () {

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
      controller = $controller('adminManageSeniorsCtrl', {$scope: scope});
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

  //FIXME:Something is wrong with this functionality, need to look into later
 /* describe('Pagination',function(){
    beforeEach(function(){
      controller.recordPerPage = 10;
      controller.page = 1;
      controller.sort = {
        'userData.lastName': -1
      };
    });
    it('changing the records per page changes the query options limit',function(){
      controller.recordPerPage = 20;
      console.log(controller.queryOptions);
      chai.assert.equal(controller.queryOptions.limit,controller.recordPerPage);
    });
    it('changing the page changes the query options skip',function(){
      controller.page = 2;
      chai.assert.equal(controller.queryOptions.skip,controller.page);
    });
    it('changing the sort changes the query options sort',function(){
      controller.sort = {'userData.firstName':-1};
      chai.assert.equal(controller.queryOptions.sort,controller.sort);
    })
  })*/

});