/**
 * Created by sarahcoletti on 2/17/16.
 */
angular.module('visitry').directive('agencyList', function () {
  return {
    restrict: 'E',
    templateUrl: () => {
      if (Meteor.isCordova) {
        return '/packages/visitrymobile/client/agencies/agency-list/agency-list.html';
      } else {
        return '/packages/visitry-browser/client/agencies/agency-list/agency-list.html';
      }
    },
    controllerAs: 'agencyList',
    controller: function ($scope, $reactive, $mdDialog, $filter) {
      $reactive(this).attach($scope);

      this.perPage = 3;
      this.page = 1;
      this.sort = {
        name: 1
      };
      this.orderProperty = '1';
      this.searchText = '';

      this.helpers({
        agencies: () => {
          return Agencies.find({}, {sort: this.getReactively('sort')});
        }
      });

      this.subscribe('agencies', () => {
        return [
          {
            limit: parseInt(this.perPage),
            skip: parseInt((this.getReactively('page') - 1) * this.Page),
            sort: this.getReactively('sort')
          },
          this.getReactively('searchText')
        ]
      });

    }
  }
});
