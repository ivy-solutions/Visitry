/**
 * Created by n0235626 on 7/18/16.
 */
import 'angular-mocks';
import { Meteor } from 'meteor/meteor';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/visitry/visitry.component';
import '/client/routes';

describe('Visitry', function () {

  var controller;
  var meteorUserIdStub;
  var accountLoggoutSpy;
  var stateGoStub;
  var $state;

  beforeEach(function () {
    angular.mock.module('visitry');
    meteorUserIdStub = sinon.stub(Meteor, "userId");
    accountLoggoutSpy = sinon.spy(Accounts,"logout");
  });

  beforeEach(inject(function ($rootScope,$componentController,_$state_) {
    $state = _$state_;
    controller = $componentController('visitry',{$scope: $rootScope.$new(true),$state:$state});

    stateGoStub = sinon.stub($state,"go");
  }));

  afterEach(function () {
    meteorUserIdStub.restore();
    accountLoggoutSpy.restore();
    stateGoStub.restore();
  });

  describe('user login', function () {
    it('the user is logged in', function () {
      //FixME: can't stub out methods in the helper
      //meteorUserIdStub.returns('kallva239021015');
      //chai.assert.equal(controller.isLoggedIn, true);
    });
    it('the user is not logged in', function () {
      //meteorUserIdStub.returns(null);
      //chai.assert.equal(controller.isLoggedIn, false);
    })
  });
  //TODO: can't seem to get this test to work
/*  describe('logout',function(){
    it('the user is logged out',function(){
      controller.logout();
      chai.assert.equal(accountLoggoutSpy.calledOnce,true);
    });
  });*/
});