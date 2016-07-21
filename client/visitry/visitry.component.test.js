/**
 * Created by n0235626 on 7/18/16.
 */
import 'angular-mocks';
import { Meteor } from 'meteor/meteor';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/visitry/visitry.component';

describe('Visitry', function () {

  var controller;
  var meteorUserIdStub;
  var accountLoggoutSpy;

  beforeEach(function () {
    angular.mock.module('visitry');
  });

  beforeEach(inject(function ($rootScope,$componentController) {
    controller = $componentController('visitry',{$scope: $rootScope.$new(true)});
    meteorUserIdStub = sinon.stub(Meteor, "userId");
    accountLoggoutSpy = sinon.spy(Accounts,"logout");
  }));

  afterEach(function () {
    meteorUserIdStub.restore();
  });

  describe('user login', function () {
    it('the user is logged in', function () {
      meteorUserIdStub.returns('kallva239021015');
      chai.assert.equal(controller.isLoggedIn(), true);
    });
    it('the user is not logged in', function () {
      meteorUserIdStub.returns(null);
      chai.assert.equal(controller.isLoggedIn(), false);
    })
  });
  describe('logout',function(){
    it('the user is logged out',function(){
      controller.logout();
      chai.assert(accountLoggoutSpy.calledOnce);
    })
  })
});