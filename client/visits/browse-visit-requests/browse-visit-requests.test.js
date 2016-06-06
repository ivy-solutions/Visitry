/**
 * Created by sarahcoletti on 5/31/16.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import '/client/visits/browse-visit-requests/browse-visit-requests.component.js';
import StubCollections from 'meteor/hwillson:stub-collections';
import Visits from '/model/visits.js'
import myFunctions from '/client/lib/sharedFunctions.js'

describe ( 'BrowseVisitRequests', function() {



  beforeEach(function() {
    angular.mock.module('visitry');
   });

  beforeEach(inject(function(_$controller_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  var controller;
  beforeEach(function() {
    StubCollections.add([Visits]);
    sinon.stub(Meteor.myFunctions, 'dateSortArray');
    inject( function ($rootScope) {
      controller = $controller('browseVisitRequestsCtrl', { $scope: $rootScope.$new(true) });
    });
  });

  afterEach(function() {
    StubCollections.restore();
    Meteor.myFunctions.dateSortArray.restore();
  });


  describe( 'settings', function() {
    it('showDelete - no', function () {
      chai.assert.equal(controller.showDelete,false);
    });
    it('canSwipe - yes', function () {
      chai.assert.equal(controller.canSwipe,true);
    });
    it('listSort - requestedDate', function () {
      chai.assert.equal(controller.listSort.requestedDate, 1);
    });
  });

  describe( 'getDistanceToVisitLocation', function() {
    let visit = {
      "location": {
        "name":"Boston",
        "latitude": 42.3601,
        "longitude": -71.0589
      }
    };
    let user = {
      "location": {
        "name":"Boston",
        "latitude": 42,
        "longitude": -71
      }
    };


    it('when no user location, distance = 0', function () {
      controller.currentUser = null;
      chai.assert.equal(controller.getDistanceToVisitLocation(visit), "0");
    });

    it( 'when no visit location return "No visit location', function() {
      controller.currentUser = user;
      let noLocation = {};
      chai.assert.equal(controller.getDistanceToVisitLocation(noLocation), "No visit location");
    });

    it ('distance is positive number when there is both a visit and a user location', function() {
      controller.currentUser = user
      var distance = controller.getDistanceToVisitLocation(visit);
      chai.expect(distance).to.be.a('string');
      var d = Number(distance);
      chai.assert.isNumber(d);
      chai.assert.isTrue( d > 0 );
    });
  });

});

