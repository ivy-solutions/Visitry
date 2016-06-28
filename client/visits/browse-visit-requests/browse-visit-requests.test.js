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
  var scope;
  var findOneStub;

  beforeEach(function() {
    StubCollections.add([Visits]);
    sinon.stub(Meteor.myFunctions, 'groupVisitsByRequestedDate');
    inject( function ($rootScope) {
      scope = $rootScope.$new(true)
      controller = $controller('browseVisitRequestsCtrl', { $scope: scope });
    });
  });

  afterEach(function() {
    Meteor.myFunctions.groupVisitsByRequestedDate.restore();
    StubCollections.restore();
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
        "name":"35 Bayview Ave., Monument Beach, MA",
        "geo": { "type": "Point",
          "coordinates": [-70.6140227, 41.717825]
        }
      }
    };


    it('when no user location, return no string', function () {
      controller.fromLocation = null;
      chai.assert.equal(controller.getDistanceToVisitLocation(visit), "");
    });

    it( 'when no visit location, return no string ', function() {
      let noLocation = {};
      chai.assert.equal(controller.getDistanceToVisitLocation(noLocation), "");
    });

    it ('distance is an accurate number when there is both a visit and a user location', function() {
      controller.hasLocation = true;
      controller.fromLocation = {
        "type": "Point",
        "coordinates": [-71.477358, 42.468846]
      };
      var distance = controller.getDistanceToVisitLocation(visit);
      chai.expect(distance).to.be.a('string');
      chai.assert.equal( distance, "68.2 miles");
    });
  });

});

