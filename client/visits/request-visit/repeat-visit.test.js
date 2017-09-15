/**
 * Created by sarahcoletti on 9/15/17.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/visits/request-visit/repeat-visit.controller';
import '/client/visits/request-visit/request-visit-modal.service';

describe('Repeat Visit', function () {
  beforeEach(function () {
    angular.mock.module('visitry');
  });

  beforeEach(inject(function (_$controller_,_RequestVisit_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
    RequestVisit = _RequestVisit_;
  }));

  var controller;
  var stateSpy;
  var requestVisitSpy;


  var findUserStub;
  beforeEach(function () {
    findUserStub = sinon.stub(User, 'findOne');
    findUserStub.returns({
      username: 'Violetta'
    });
    requestVisitSpy = sinon.spy(RequestVisit, 'showModal');
    inject(function ($rootScope, $state, $stateParams) {
      $stateParams.priorVisitId = Random.id();
      controller = $controller('repeatVisitController', {$scope: $rootScope.$new(true)});
      stateSpy = sinon.stub($state, 'go');
    });
  });
  afterEach( function() {
    User.findOne.restore();
  });

  it("dismiss goes to pendingVisits ", function () {
    controller.dismiss();
     chai.assert.isTrue(stateSpy.withArgs('pendingVisits').calledOnce)
  });

  it("scheduledVisit calls RequestVisit and goes to pendingVisits ", function () {
    controller.scheduleVisit();
    chai.assert.isTrue(requestVisitSpy.called);
    chai.assert.isTrue(stateSpy.withArgs('pendingVisits').calledOnce)
  });

});