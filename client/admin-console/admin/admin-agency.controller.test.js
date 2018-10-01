/**
 * Created by Daniel Biales on 1/19/17.
 */

import 'angular-mocks';
import { Meteor } from 'meteor/meteor';
import { visitry } from '/client/lib/app.js';
import {assert} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/admin-console/admin/admin-agency.controller.js';
import {Agencies, Agency} from '/model/agencies';

describe('Admin Admin Agency', function () {

  beforeEach(function () {
    angular.mock.module('visitry');
  });

  beforeEach(inject(function (_$controller_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  var controller;
  var scope;
  let agencyId;
  let stateSpy;
  let agency = {
    name: 'testAgency',
    contactPhone: '1234567890',
    contactEmail: 'contact@email.com',
    description: 'this is a description'
  };
  describe('Editing An Agency', function() {

    beforeEach(function () {
      agencyId = Agencies.insert(agency);
      inject(function ($rootScope, $state, $stateParams) {
        scope = $rootScope.$new(true);
        controller = $controller('adminAdminAgencyCtrl', {
          $scope: scope,
          $state: $state,
          $stateParams: {'agencyId': agencyId}
        });
        stateSpy = sinon.stub($state, 'go');
      });
    });

    afterEach(function () {
      stateSpy.restore();
    });

    describe('editAgency', ()=> {
      it('editAgency enables editMode', ()=> {
        controller.editAgency();
        assert.isTrue(controller.isEditMode);
      });
    });

    describe('this.agency', ()=> {
      it('this.agency exists if $stateParam is set', ()=> {
        assert.equal(controller.agency.name, agency.name);
      })
    });

    describe('save', ()=> {
      let form;
      let meteorCallStub;

      beforeEach(()=> {
        form = {$valid: true};
        meteorCallStub = sinon.stub(Meteor, 'call');
      });
      afterEach(()=> {
        Meteor.call.restore();
      });
      it('update Agency with valid form', ()=> {
        controller.save(form);
        assert.isTrue(Meteor.call.calledWith('updateAgency'));
      });
      it('update Agency not called ', ()=> {
        form.$valid = false;
        form.$error = {};
        controller.save(form);
        assert.isFalse(Meteor.call.calledWith('updateAgency'));
      });
    });

    describe('addAdmin', function () {
      it('navigate to the register screen', ()=> {
        controller.addAdmin();
        assert(stateSpy.withArgs('register', {role: "administrator", agencyId: agencyId}).calledOnce);
      });
    });
  });

  describe('Creating An Agency - no agencyId is passed', function() {

    beforeEach(function () {
      inject(function ($rootScope, $state, $stateParams) {
        scope = $rootScope.$new(true);
        controller = $controller('adminAdminAgencyCtrl', {
          $scope: scope,
          $state: $state,
          $stateParams: {}
        });
        stateSpy = sinon.stub($state, 'go');
      });
    });

    afterEach(function () {
      stateSpy.restore();
    });

    describe('editMode by default', ()=> {
      it('editMode by default is true', ()=> {
        assert.isTrue(controller.isEditMode);
      });
    });

    describe('this.agency', ()=> {
      it('this.agency does not exist', ()=> {
        assert.equal(controller.agency, undefined);
      })
    });
  });

});