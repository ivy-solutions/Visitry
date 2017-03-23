/**
 * Created by Daniel Biales on 1/22/17.
 */

import 'angular-mocks';
import { Meteor } from 'meteor/meteor';
import { visitry } from '/client/lib/app.js';
import {assert} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/feedback/app-feedback.controller.js';

describe('App Feedback', function () {

  beforeEach(() => {
    angular.mock.module('visitry');
  });

  let controller;
  let scope;
  let stateSpy;
  let meteorCallStub;


  beforeEach(inject(function (_$controller_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));


  beforeEach(()=> {
    meteorCallStub = sinon.stub(Meteor, 'call');

    inject(function ($rootScope, $state) {
      scope = $rootScope.$new(true);
      controller = $controller('appFeedbackCtrl', {
        $scope: scope,
        $state: $state}
      );
      stateSpy = sinon.stub($state, 'go');
      controller.setAgencyIds = function() {};
    });
  });

  afterEach(()=> {
    Meteor.call.restore();
    if (stateSpy) {
      stateSpy.restore();
    }
  });

  describe('submitFeedback', ()=> {

    it('submit feedback calls trello create card service', ()=> {
      controller.feedback.title = 'Test';
      controller.feedback.comments = 'This is a test.';
      controller.feedback.type = 'BUG';
      controller.feedback.agencyIds = ['agency1'];
      controller.submitFeedback({$valid: true});
      assert.isTrue(meteorCallStub.calledWith('addNewQACard', 'Test', 'This is a test.\nAgencies: [agency1]', 'BUG'), 'bad arguments');
      assert.isTrue(stateSpy.calledWith('login'), 'bad navigation');
    });
    it('submit feedback works without agencyIds', ()=> {
      controller.feedback.title = 'Test';
      controller.feedback.comments = 'This is a test.';
      controller.feedback.type = 'BUG';
      controller.submitFeedback({$valid: true});
      assert.isTrue(meteorCallStub.calledWith('addNewQACard', 'Test', 'This is a test.\nAgencies: []', 'BUG'), 'bad arguments');
      assert.isTrue(stateSpy.calledWith('login'), 'bad navigation');
    });
  });
});