/**
 * Created by Daniel Biales on 1/22/17.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {assert} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/feedback/app-feedback-trello.service.js';

describe('App Feedback Trello Service', function () {

  var service;
  var $http;
  var httpStub;

  beforeEach(function () {
    angular.mock.module('visitry');
  });

  beforeEach(inject(function (appFeedbackTrelloService, _$http_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    service = appFeedbackTrelloService;
    $http = _$http_;
    httpStub = sinon.stub($http, 'post', (...args)=> {
      return args;
    })
  }));


  afterEach(function () {
  });
  describe('add New Card to Customer QA', ()=> {

    it('API is called', ()=> {
      let result = service.addNewQACard('title', 'desc', 'type');
      assert.equal(result[0], 'https://api.trello.com/1/cards');
      assert.propertyVal(result[1], 'idList', '5885424ab2b08d18d2363edf');
      assert.propertyVal(result[1], 'desc', 'type: desc');
      assert.propertyVal(result[1], 'name', 'title');
      assert.deepProperty(result[2], 'params.key');
      assert.deepProperty(result[2], 'params.token');
    });
  });
});