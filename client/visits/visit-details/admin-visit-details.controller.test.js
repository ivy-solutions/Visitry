/**
 * Created by Daniel Biales on 2/28/17.
 */


import 'angular-mocks';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import {assert} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/visits/visit-details/admin-visit-details.controller.js';
import { Visit,Visits } from '/model/visits'
import { Feedback,Feedbacks } from '/model/feedback'

describe('AdminVisitDetails', function () {

  beforeEach(function () {
    angular.mock.module('visitry');
  });

  let controller;

  beforeEach(inject(function (_$controller_, _$cookies_, $rootScope) {
    $cookies = _$cookies_;
    // FIXME - The version of angular that meteor-angular uses (1.3.11) does not support the locals binding
    controller = _$controller_('adminVisitDetailsCtrl', {$scope: $rootScope.$new(true)}, {locals: {visitId: Random.id()}});
  }));

  afterEach(function () {
  });

  describe.skip('AgencyId Cookie', () => {
    beforeEach(()=> {
      $cookies.put('agencyId', Random.id());
    });
    afterEach(()=> {
      $cookies.remove('agencyId');
    });
    it('agencyId cookie is not null', ()=> {
      assert.isNotNull(controller.agencyId);
    });
  });

  describe.skip('visitStatus', ()=> {
    it('return completed', ()=> {
    });
    it('return available', ()=> {
    });
    it('return scheduled', ()=> {
    });
    it('return unfilled', ()=> {
    });
  });

  describe.skip('requester', ()=> {
    it('returns requester details', ()=> {
    });
  });

  describe.skip('visitor', ()=> {
    it('returns visitor details', ()=> {
    });
    it('returns null if visitorId is undefined', ()=> {
    });
  });

  describe.skip('requesterFeedback', ()=> {
    it('returns requesterFeedback', ()=> {
    });
    it('returns null if no requesterFeedback', ()=> {
    });
  });

  describe.skip('visitorFeedback', ()=> {
    it('returns visitorFeedback', ()=> {
    });
    it('returns null if no visitorFeedback', ()=> {
    });
  });

});
