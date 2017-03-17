/**
 * Created by sarahcoletti on 3/13/17.
 */
import { Roles } from 'meteor/alanning:roles'
import { Agency } from '/model/agencies'

angular.module('visitry').controller('chooseAgencyCtrl', function ($scope, $cookies, $reactive, $mdDialog) {
  $reactive(this).attach($scope);

  this.agencies;
  this.selected = $cookies.get('agencyId');

  this.helpers ({
    myAgencies:() => {
      let agencies = Roles.getGroupsForUser(Meteor.userId());
      let administratorAgencies = agencies.filter(function (agency) {
        return Roles.userIsInRole(Meteor.userId(), 'administrator', agency) && agency != 'noagency';
      });
      if ( !Roles.userIsInRole(Meteor.userId(), 'administrator', 'allAgencies')) {
        this.agencies = Agency.find({_id: {$in: administratorAgencies}, activeUntil: {$gt: new Date()}});
      } else { //superUser with allAgencies gets to see everything
        this.agencies = Agency.find();
      }
      return this.agencies;
    }
  });

  $scope.closeDialog = function() {
    $mdDialog.hide();
  };

  this.selectAgency = () => {
    $cookies.put('agencyId', this.selected);
    $scope.closeDialog();
  }

});