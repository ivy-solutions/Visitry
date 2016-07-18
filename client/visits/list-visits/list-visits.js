/**
 * Created by sarahcoletti on 2/18/16.
 */
import { User } from '/model/users'

angular.module('visitry').directive('listVisits', function () {
  return {
    restrict: 'E',
    templateUrl: 'client/visits/list-visits/list-visits.html',
    controllerAs: 'listVisits',
    controller: function ($scope, $reactive, $mdDialog, $filter) {
      $reactive(this).attach($scope);

      this.perPage = 3;
      this.page = 1;
      this.sort = {
        name: 1
      };
      this.orderProperty = '1';
      this.searchText = '';

      this.subscribe('images');
      this.subscribe('users');
      this.subscribe('visits', () => {
        return [
          {
            limit: parseInt(this.perPage),
            skip: parseInt((this.getReactively('page') - 1) * this.perPage),
            sort: this.getReactively('sort')
          },
          this.getReactively('searchText')
        ]
      });

      this.pageChanged = (newPage) => {
        this.page = newPage;
      };

      this.updateSort = () => {
        this.sort = {
          name: parseInt(this.orderProperty)
        }
      };

      this.getUserById = (userId) => {
        return User.findOne(userId);
      };

    }
  }
});
