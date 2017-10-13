/**
 * Created by sarahcoletti on 10/12/17.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai, assert} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/visits/visit-details/edit-visit.controller';

describe('Edit Visit', function () {

  beforeEach(function () {
    angular.mock.module('visitry');
  });


  beforeEach(inject(function (_$controller_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  var controller;
  var stateSpy;
  var tomorrow;
  var meteorCallStub;

  beforeEach(function () {
    meteorCallStub = sinon.stub(Meteor, 'call');

    inject(function ($rootScope, $state) {
      scope = $rootScope.$new(true);
      controller = $controller('editVisitCtrl', {
        $scope: scope,
        $state: $state}
      );
      stateSpy = sinon.stub($state, 'go');
    });
    controller.requester = {userData: {firstName: "Requester", picture: "Requester's picture"}};
    tomorrow = new Date();
    tomorrow.setTime(tomorrow.getTime() + ( 24 * 60 * 60 * 1000));
  });

  afterEach(function () {
    meteorCallStub.restore();
    if (stateSpy) {
      stateSpy.restore();
    }
  });

  describe("isDateValid", function () {
    it("date is today", function () {
      controller.visit = {requestedDate : new Date() };
      assert.isFalse(controller.isDateValid());
    });
    it("date is tomorrow", function () {
      controller.visit = {requestedDate : tomorrow };
      assert.isTrue(controller.isDateValid());
    });
  });

  it("cancel goes to login ", function () {
    controller.cancel();
    assert.isTrue(stateSpy.withArgs('login').calledOnce)
  });

  it("submit goes nowhere if day is not valid ", function () {
    var beforeNow = new Date();
    beforeNow.setTime( beforeNow.getTime() - 5 * 1000 );
    controller.visit = {requestedDate : beforeNow };
    controller.submit();
    assert.isFalse(meteorCallStub.calledWith('visits.updateVisit'));
    assert.isFalse(stateSpy.withArgs('login').calledOnce)
  });

  it("submit goes to login if day is  valid ", function () {
    controller.visit = {requestedDate : tomorrow };
    controller.submit();
    assert.isTrue(meteorCallStub.calledWith('visits.updateVisit'));
    assert.isTrue(stateSpy.withArgs('login').calledOnce)
  });

});
