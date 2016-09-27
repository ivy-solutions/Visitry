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

  describe('Tabs allowed in state',function(){
    it('the state is visits',function(){
      $state.current={name:"visits"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });
    it('the state is browse requests',function(){
      $state.current={name:"browseRequests"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });
    it('the state is upcoming',function(){
      $state.current={name:"upcoming"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });
    it('the state is visitsDetails',function(){
      $state.current={name:"visitDetails"};
      chai.assert.isFalse(controller.isTabsAllowedInState());
    });
    it('the state is login',function(){
      $state.current={name:"login"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });
    it('the state is register',function(){
      $state.current={name:"register"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });
    it('the state is visits',function(){
      $state.current={name:"visits"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });
    it('the state is profile',function(){
      $state.current={name:"profile"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });
    it('the state is requesterFeedback',function(){
      $state.current={name:"requesterFeedback"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });
    it('the state is visitorFeedbackList',function(){
      $state.current={name:"visitorFeedbackList"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });
    it('the state is agencyList',function(){
      $state.current={name:"agencyList"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });
    it('the state is adminHome',function(){
      $state.current={name:"adminHome"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });
    it('the state is adminManage',function(){
      $state.current={name:"adminManage"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });
    it('the state is adminManageSeniors',function(){
      $state.current={name:"adminManageSeniors"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });
    it('the state is adminAnalytics',function(){
      $state.current={name:"adminAnalytics"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });
    it('the state is adminAdmin',function(){
      $state.current={name:"adminAdmin"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });
    it('the state is adminHelpOverview',function(){
      $state.current={name:"adminHelpOverview"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });
    it('the state is adminHelpAbout',function(){
      $state.current={name:"adminHelpAbout"};
      chai.assert.isTrue(controller.isTabsAllowedInState());
    });

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
  //TODO: can't seem to get this test to work  - causes timeout on build machine
/*  describe('logout',function(){
    it('the user is logged out',function(){
      controller.logout();
      chai.assert.equal(accountLoggoutSpy.calledOnce,true);
    });
  });
  */
});