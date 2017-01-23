/**
 * Created by Daniel Biales on 8/30/16.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {assert} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/admin-console/manage/manage.controller';

describe('Admin Manage', function () {

  beforeEach(()=> {
    angular.mock.module('visitry');
  });

  beforeEach(inject(function (_$controller_, _$cookies_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
    $cookies = _$cookies_;
  }));

  var controller;
  var scope;

  beforeEach(()=> {
    inject(function ($rootScope) {
      scope = $rootScope.$new(true);
      controller = $controller('adminManageCtrl', {$scope: scope});
    });
  });

  afterEach(()=> {
  });

  describe('AgencyId Cookie', () => {
    beforeEach(()=> {
      $cookies.put('agencyId', Random.id)
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
      meteorCallSpy = sinon.spy(Meteor,'call');
    });
    afterEach(()=>{
      meteorCallSpy.reset();
      Meteor.call.restore();
    });
    it('confirm user calls addUserToAgency',()=>{
      controller.confirmUser('userId');
      assert.isTrue(meteorCallSpy.calledWith('addUserToAgency'));
    })
  })

});