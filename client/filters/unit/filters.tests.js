/**
 * Created by sarahcoletti on 5/27/16.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { firstNameLastInitial } from '/client/filters/firstNameLastInitial'
import { approximateLocation } from '/client/filters/approximateLocation'
import { timeOfDay } from '/client/filters/timeOfDay'

describe( 'Filters ', function () {
  var $filter;

  beforeEach( function() {
    angular.mock.module('visitry');
  });


  describe( 'Filter: firstNameLastInitial', function() {

     beforeEach( inject( function(_$filter_) {
       $filter = _$filter_;
      }));

    describe('return "No User" when there is no user passed', function () {
      it('returns string when no user', function() {
        var firstNameLastInitial = $filter('firstNameLastInitial');
        chai.assert.equal(firstNameLastInitial(null), 'No User');
      });
    });

    describe('when user has first name but no last name', function () {
      it('returns first name', function() {
        let user = {
          userData : {
            firstName: "Prince",
            lastName: ""
          }
        };
        var firstNameLastInitial = $filter('firstNameLastInitial');
        chai.assert.equal(firstNameLastInitial(user), 'Prince');
      });
    });

    describe('when user has last name but no first name', function () {
      it('returns last name', function() {
        let user = {
          userData : {
            firstName: "",
            lastName: "Pedroia"
          }
        };
        var firstNameLastInitial = $filter('firstNameLastInitial');
        chai.assert.equal(firstNameLastInitial(user), 'Pedroia');
      });
    });

    describe('when user has both first and last name', function () {
      it('returns first l.', function() {
        let user = {
          userData : {
            firstName: "Martin",
            lastName: "O'Malley"
          }
        };
        var firstNameLastInitial = $filter('firstNameLastInitial');
        chai.assert.equal(firstNameLastInitial(user), 'Martin O.');
      });
    });

    describe('when user has neither first or last name', function () {
      it('returns username', function() {
        let user = {
          username: 'nameless'
        };
        let user2 = {
          username: 'anonymous',
          userData : {
            firstName: "",
            lastName: ""
          }
        };
        var firstNameLastInitial = $filter('firstNameLastInitial');
        chai.assert.equal(firstNameLastInitial(user), 'nameless');
        chai.assert.equal(firstNameLastInitial(user2), 'anonymous');
      });
    });
  });

  describe( 'Filter: approximateLocation', function() {

    beforeEach(inject(function (_$filter_) {
      $filter = _$filter_;
    }));

    describe('return "No Location" when there is no location passed', function () {
      it('returns string when no location', function () {
        var approximateLocation = $filter('approximateLocation');
        chai.assert.equal(approximateLocation(null), 'No Location');
      });
    });

    describe('returns street and town', function () {
      it('extracts street and town without street number', function () {
        let fullAddresses = [
          {name: "100 Pennsylvania Avenue, Washington, D.C., United States"},
          {name: "12 E 49th St, New York, NY, United States"},
          {name: "Museum of Fine Arts, Boston, Huntington Avenue, Boston, MA"},
          {name: "Massachusetts General Hospital, Fruit Street, Boston, MA"}];
        var approximateLocation = $filter('approximateLocation');
        chai.assert.equal(approximateLocation(fullAddresses[0]), 'Pennsylvania Avenue, Washington');
        chai.assert.equal(approximateLocation(fullAddresses[1]), 'E 49th St, New York');
        chai.assert.equal(approximateLocation(fullAddresses[2]), 'Museum of Fine Arts, Boston, Huntington Avenue');
        chai.assert.equal(approximateLocation(fullAddresses[3]), 'Massachusetts General Hospital, Fruit Street');
      });
    });

    describe('returns town when street not specified', function () {
      it('returns town', function () {
        let partialAddress = {name: "Boston, MA"};
        var approximateLocation = $filter('approximateLocation');
        chai.assert.equal(approximateLocation(partialAddress), 'Boston');
      });
    });
  });

  describe( 'Filter: timeOfDay', function() {

    beforeEach( inject( function(_$filter_) {
      $filter = _$filter_;
    }));

    describe('return "No Time Specified" when there is no time passed', function () {
      it('returns string when no time passed', function() {
        var timeOfDay = $filter('timeOfDay');
        chai.assert.equal(timeOfDay(null), 'No Time Specified');
      });
    });

    describe('return time of day depending on hour', function () {
      it('returns string indicating "Morning,Afternoon,Evening,Any time"', function() {
        var timeOfDay = $filter('timeOfDay');
        var morning = new Date('Thu, 02 Jun 2016 09:00:00 GMT-0400 (EDT)');
        var afternoon = new Date('Thu, 02 Jun 2016 13:00:00 GMT-0400 (EDT)');
        var evening = new Date('Thu, 02 Jun 2016 16:00:00 GMT-0400 (EDT)');
        var anytime = new Date('Thu, 02 Jun 2016 07:00:00 GMT-0400 (EDT)');
        chai.assert.equal(timeOfDay(morning), 'Morning');
        chai.assert.equal(timeOfDay(afternoon), 'Afternoon');
        chai.assert.equal(timeOfDay(evening), 'Evening');
        chai.assert.equal(timeOfDay(anytime), 'Any time');
      });
    });

  });

});
