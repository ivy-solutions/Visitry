/**
 * Created by Daniel Biales on 1/18/17.
 */
import { Agency,Agencies } from '/model/agencies'
import {logger} from '/client/logging'

angular.module('visitry.browser').controller('adminAdminAgencyCtrl', function ($scope, $state, $stateParams, $reactive, $mdDialog) {
  $reactive(this).attach($scope);

  this.subscribe('userdata');
  this.agencyId = $stateParams.agencyId;
  this.agency = {};
  this.helpers({
    getAgency: ()=> {
      this.agency = Agency.findOne({_id: this.getReactively('agencyId')});
    },
    administrators: ()=> {
      let selector = {};
      selector['roles.'+this.getReactively('agencyId')] = 'administrator';
      return User.find(selector);
    }
  });

  this.isEditMode = !$stateParams.agencyId;

  this.editAgency = ()=> {
    this.isEditMode = true;
  };

  this.save = (form)=> {
    if (form.$valid) {
      Meteor.call('updateAgency', this.agency._id, {
        name: this.agency.name,
        contactPhone: this.agency.contactPhone,
        contactEmail: this.agency.contactEmail,
        description: this.agency.description,
        location: addNewLocation(this.agency.location),
        timezone: this.agency.timezone,
        welcomeMessage: this.agency.welcomeMessage
      }, (err, result)=> {
        if (err) {
          logger.error('Error updating ' + this.agency.name + ' ' + err);
          handleError(err);
        } else {
          logger.error('Editing ' + this.agency.name + " with id:" + result);
          this.isEditMode = false;
          this.agencyId = result;
        }
      })
    } else {
      let errors = '';
      for (key of Object.keys(form.$error)) {
        switch (form.$error[key][0].$name) {
          case 'email':
            errors += '<div>Email must look like an email.</div>';
            break;
          case 'website':
            errors += '<div>Website must be a valid web address.</div>';
            break;
          case 'phone':
            errors += '<div>Phone number must be 9 digits.</div>';
            break;
          default:
            errors += '<div>Invalid ' + form.$error[key][0].$name + '</div>';
            break;
        }
      }
      $mdDialog.show(
        $mdDialog.alert()
          .title('Invalid')
          .htmlContent(errors)
          .ok('ok')
      );
    }
  };

  function handleError(err) {
    logger.info('userData save error ', err.reason);
    $mdDialog.show(
      $mdDialog.alert()
        .title('Update failed')
        .textContent(err.reason || 'Please try again')
        .ok('ok')
    )
  }

  function addNewLocation(location) {
    let newLocation = location;
    if (location && location.details) {
      newLocation = {
        address: location.details.name + ", " + location.details.vicinity,
        formattedAddress: location.details.formatted_address,
        geo: {
          type: "Point",
          coordinates: [location.details.geometry.location.lng(), location.details.geometry.location.lat()]
        }
      };
    }
    return newLocation;
  }

  this.addAdmin = () => {
    $state.go('register', {role: 'administrator'});
  };

  this.timezones = [
    {
      "value":"Hawaii",
      "name":"(GMT-10:00) Hawaii"
    },
    {
      "value":"Alaska",
      "name":"(GMT-09:00) Alaska"
    },
    {
      "value":"America/Anchorage",
      "name":"(GMT-09:00) America/Anchorage"
    },
    {
      "value":"America/Los_Angeles",
      "name":"(GMT-08:00) America/Los Angeles"
    },
    {
      "value":"Pacific Time (US & Canada)",
      "name":"(GMT-08:00) Pacific Time (US & Canada)"
    },
    {
      "value":"America/Denver",
      "name":"(GMT-07:00) America/Denver"
    },
    {
      "value":"America/Phoenix",
      "name":"(GMT-07:00) America/Phoenix"
    },
    {
      "value":"Arizona",
      "name":"(GMT-07:00) Arizona"
    },
    {
      "value":"Mountain Time (US & Canada)",
      "name":"(GMT-07:00) Mountain Time (US & Canada)"
    },
    {
      "value":"America/Chicago",
      "name":"(GMT-06:00) America/Chicago"
    },
    {
      "value":"Central Time (US & Canada)",
      "name":"(GMT-06:00) Central Time (US & Canada)"
    },
    {
      "value":"America/New_York",
      "name":"(GMT-05:00) America/New York"
    },
    {
      "value":"Eastern Time (US & Canada)",
      "name":"(GMT-05:00) Eastern Time (US & Canada)"
    },
    {
      "value":"Indiana (East)",
      "name":"(GMT-05:00) Indiana (East)"
    },
    {
      "value":"Atlantic Time (Canada)",
      "name":"(GMT-04:00) Atlantic Time (Canada)"
    },
    {
      "value":"Newfoundland",
      "name":"(GMT-03:30) Newfoundland"
    },
  ];
});