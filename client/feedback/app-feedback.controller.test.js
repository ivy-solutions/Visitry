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
  let appFeedbackTrelloServiceStub;

  beforeEach(inject(function (_$controller_, _$cookies_, _appFeedbackTrelloService_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
    $cookies = _$cookies_;
    appFeedbackTrelloService = _appFeedbackTrelloService_;
  }));


  beforeEach(()=> {

    inject(function ($rootScope, $state, appFeedbackTrelloService) {
      scope = $rootScope.$new(true);
      controller = $controller('appFeedbackCtrl', {
        $scope: scope,
        $state: $state,
        appFeedbackTrelloService: appFeedbackTrelloService
      });
      stateSpy = sinon.stub($state, 'go');
      appFeedbackTrelloServiceStub = sinon.stub(appFeedbackTrelloService, 'addNewQACard');
    });
  });

  afterEach(function () {
    appFeedbackTrelloService.addNewQACard.restore();
    stateSpy.restore();
  });

  describe('submitFeedback', ()=> {
    it('submit feedback calls trello create card service', ()=> {
      controller.feedback.title = 'Test';
      controller.feedback.comments = 'This is a test.';
      controller.feedback.type = 'BUG';
      controller.feedback.agencyIds = ['agency1'];
      controller.submitFeedback({$valid: true});
      assert.isTrue(appFeedbackTrelloServiceStub.calledWith('Test', 'This is a test.\nAgencies: [agency1]', 'BUG'));
      assert.isTrue(stateSpy.calledWith('/'));
    });
    it('submit feedback works without agencyIds',()=>{
      controller.feedback.title = 'Test';
      controller.feedback.comments = 'This is a test.';
      controller.feedback.type = 'BUG';
      controller.submitFeedback({$valid: true});
      assert.isTrue(appFeedbackTrelloServiceStub.calledWith('Test', 'This is a test.\nAgencies: []', 'BUG'));
      assert.isTrue(stateSpy.calledWith('/'));
    })
  });
});