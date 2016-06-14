/**
 * Created by sarahcoletti on 6/14/16.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/visits/visit-details/visit-details.controller';


describe('View Visit Details', function () {

  beforeEach(function () {
    angular.mock.module('visitry');
  });

  beforeEach(inject(function (_$controller_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  var controller;

  beforeEach(function () {
    inject(function ($rootScope, $state) {
      controller = $controller('visitDetailsCtrl', {
        $scope: $rootScope.$new(true),
        $state: $state
      });
    });
  });

  afterEach(function () {
  });

  describe( "isVisitor", function () {
    it( "is true", function() {
      controller.visit = {visitorId : Meteor.userId};
      chai.assert(controller.isVisitor);
    });
    it( "visitor is someone else", function() {
      controller.visit = {visitorId : 'someOtherUser'};
      chai.assert(controller.isVisitor, false);
    });
    it( "no visitor", function() {
      controller.visit = {};
      chai.assert(controller.isVisitor, false);
    });
  });

});
