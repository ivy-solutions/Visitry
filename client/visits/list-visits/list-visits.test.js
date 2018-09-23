/**
 * Created by sarahcoletti on 5/31/16.
 */
import 'angular-mocks';
import { Meteor } from 'meteor/meteor';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/visits/list-visits/list-visits.js';
import '/model/users.js'

describe ( 'ListVisits', function() {

  beforeEach(function() {
    window.module('visitry');
  });

  describe( 'listVisits', function() {
    var controller;
    var findOneStub;


    beforeEach(function() {
       inject( function ($rootScope, $componentController) {
        controller = $componentController('listVisits', {$scope: $rootScope.$new(true)})
        });
      findOneStub = sinon.stub(User, 'findOne');
      findOneStub.returns( { name: 'Harry' });

     });

    afterEach( function() {
      User.findOne.restore();
    });

    it('3 per page', function () {
      chai.assert.equal(controller.perPage,3);
    });

    it('page change', function () {
      var newPage = { name: 'page 2'};
      controller.pageChanged(newPage);
      chai.assert.equal(controller.page.name,'page 2');
    });

    it ('getUserById', function() {
      var user = controller.getUserById("anId");
      findOneStub.calledOnce === true;
      chai.assert.equal( user.name, "Harry");
    });
  });
});

