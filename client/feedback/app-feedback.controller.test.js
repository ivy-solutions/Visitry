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

  beforeEach(inject(function (_$controller_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));


  beforeEach(function () {

    inject(function ($rootScope, $state) {
      scope = $rootScope.$new(true);
      controller = $controller('appFeedbackCtrl', {
        $scope: $rootScope.$new(true),
        $state: $state},
        {locals: setAgencyIds = () => {}}
      );
      });
    });

  describe('submitFeedback', ()=> {
    let stateSpy;
    let meteorCallStub;

    beforeEach(()=> {
      stateSpy = sinon.stub($state, 'go');
      meteorCallStub = sinon.stub(Meteor, 'call');
    });
    afterEach(()=> {
      Meteor.call.restore();
      stateSpy.restore();
    });

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