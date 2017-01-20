/**
 * Created by Daniel Biales on 1/18/17.
 */
import { Agency,Agencies } from '/model/agencies'
import {logger} from '/client/logging'

angular.module('visitry.browser').controller('adminAdminAgencyCtrl', function ($scope, $state, $reactive, $cookies, $mdDialog) {
  $reactive(this).attach($scope);
  this.subscribe('allAgencies');
  this.agency = {};
  this.helpers({
    getAgency: ()=> {
      this.agency = Agency.findOne({_id: $cookies.get('agencyId')});

    }
  });

  this.isEditMode = false;

  this.editAgency = ()=> {
    this.isEditMode = true;
  };

  this.save = (form)=> {
    if (form.$valid) {
      Meteor.call('updateAgency', this.agency._id, {
        $set: {
          contactPhone: this.agency.contactPhone,
          contactEmail: this.agency.contactEmail,
          description: this.agency.description,
          location: addNewLocation(this.agency.location)
        }
      }, (err)=> {
        if (err) {
          logger.error('Error updating ' + this.agency.name + ' ' + err);
          handleError(err);
        } else {
          this.isEditMode = false;
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
            errors += '<div>The Agency information is invalid.</div>';
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

});