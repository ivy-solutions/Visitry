/**
 * Created by sarahcoletti on 5/27/16.
 */
import 'angular-mocks';
import { visitry } from '/client/lib/app.js';
import {chai} from 'meteor/practicalmeteor:chai';
import { firstNameLastInitial } from '/client/filters/firstNameLastInitial'
import { approximateLocation } from '/client/filters/approximateLocation'
import { timeOfDay } from '/client/filters/timeOfDay'
import { hoursMinutes } from '/client/filters/hoursMinutes'
import { streetAddress } from '/client/filters/streetAddress'

describe( 'Filters ', function () {
  var $filter;

  beforeEach( function() {
    angular.mock.module('visitry');
  });


  describe( 'Filter: firstNameLastInitial', function() {

     beforeEach( inject( function(_$filter_) {
       $filter = _$filter_;
      }));

    it('return "" when there is no user passed', function() {
      var firstNameLastInitial = $filter('firstNameLastInitial');
      chai.assert.equal(firstNameLastInitial(null), '');
    });

    it('when user has first name but no last name, returns first name', function() {
      let user = {
        userData : {
          firstName: "Prince",
          lastName: ""
        }
      };
      var firstNameLastInitial = $filter('firstNameLastInitial');
      chai.assert.equal(firstNameLastInitial(user), 'Prince');
    });

    it('when user has last name but no first name, returns last name', function() {
      let user = {
        userData : {
          firstName: "",
          lastName: "Pedroia"
        }
      };
      var firstNameLastInitial = $filter('firstNameLastInitial');
      chai.assert.equal(firstNameLastInitial(user), 'Pedroia');
    });

    it('when user has both first and last name, returns first l.', function() {
      let user = {
        userData : {
          firstName: "Martin",
          lastName: "O'Malley"
        }
      };
      var firstNameLastInitial = $filter('firstNameLastInitial');
      chai.assert.equal(firstNameLastInitial(user), 'Martin O.');
    });

    it('when user has neither first or last name, returns username', function() {
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

  describe( 'Filter: approximateLocation', function() {

    beforeEach(inject(function (_$filter_) {
      $filter = _$filter_;
    }));

    it('return "No Location" when there is no location passed', function () {
      var approximateLocation = $filter('approximateLocation');
      chai.assert.equal(approximateLocation(null), 'No Location');
    });

    it('extracts street and town without street number', function () {
      let fullAddresses = [
        {address: "100 Pennsylvania Avenue, Washington, D.C., United States"},
        {address: "12 E 49th St, New York, NY, United States"},
        {address: "Museum of Fine Arts, Boston, Huntington Avenue, Boston, MA"},
        {address: "Massachusetts General Hospital, Fruit Street, Boston, MA"}];
      var approximateLocation = $filter('approximateLocation');
      chai.assert.equal(approximateLocation(fullAddresses[0]), 'Pennsylvania Avenue, Washington');
      chai.assert.equal(approximateLocation(fullAddresses[1]), 'E 49th St, New York');
      chai.assert.equal(approximateLocation(fullAddresses[2]), 'Museum of Fine Arts, Boston, Huntington Avenue');
      chai.assert.equal(approximateLocation(fullAddresses[3]), 'Massachusetts General Hospital, Fruit Street');
    });

    it('returns town when street not specified', function () {
      let partialAddress = {address: "Boston, MA"};
      var approximateLocation = $filter('approximateLocation');
      chai.assert.equal(approximateLocation(partialAddress), 'Boston');
    });
  });

  describe( 'Filter: streetAddress', function() {

    beforeEach( inject( function(_$filter_) {
      $filter = _$filter_;
    }));

    it('return address', function() {
      let location = {formattedAddress: "80 Willow St, Acton, MA 01720, USA"}
      var streetAddress = $filter('streetAddress');
      chai.assert.equal(streetAddress(location), '80 Willow St, Acton');
    });
  });

  describe( 'Filter: timeOfDay', function() {

    beforeEach( inject( function(_$filter_) {
      $filter = _$filter_;
    }));

    it('return "No Time Specified" when there is no time passed', function() {
      var timeOfDay = $filter('timeOfDay');
      chai.assert.equal(timeOfDay(null), 'No Time Specified');
    });

    it('returns string indicating "Morning,Afternoon,Evening,Any time", depending on hour', function() {
      var timeOfDay = $filter('timeOfDay');
      //new Date(Date.UTC(year, month, day, hour, minute, second))
      var morning = new Date(2106, 6, 13, 9, 0, 0);
      var afternoon = new Date(2106, 6, 13, 13, 0, 0);
      var evening = new Date(2106, 6, 13, 16, 0, 0);
      var anytime = new Date((2106, 6, 13, 7, 0, 0));
      chai.assert.equal(timeOfDay(morning), 'Morning');
      chai.assert.equal(timeOfDay(afternoon), 'Afternoon');
      chai.assert.equal(timeOfDay(evening), 'Evening');
      chai.assert.equal(timeOfDay(anytime), 'Any time');
    });

  });

  describe( 'Filter: hoursMinutes', function() {

    beforeEach( inject( function(_$filter_) {
      $filter = _$filter_;
    }));

    it('return 0 when there is no number of minutes passed', function() {
      var hoursMinutes = $filter('hoursMinutes');
      chai.assert.equal(hoursMinutes(null), '0');
    });

    it('when minutes is less than an hour', function() {
      var hoursMinutes = $filter('hoursMinutes');
      chai.assert.equal(hoursMinutes(13), '13 min.');
    });

    it('when minutes is more than an hour', function() {
      var hoursMinutes = $filter('hoursMinutes');
      chai.assert.equal(hoursMinutes(75), '1 hr. 15 min.');
    });

    it('when minutes is 0', function() {
      var hoursMinutes = $filter('hoursMinutes');
      chai.assert.equal(hoursMinutes(0), '0 min.');
    });

  });
});
