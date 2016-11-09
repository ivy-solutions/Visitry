/**
 * Created by josiah on 9/7/16.
 */


angular.module('visitry.browser').controller('adminManageVisitorsCtrl', function ($scope, $state, $reactive, $cookies) {
    $reactive(this).attach($scope);

    this.agencyId = $cookies.get('agencyId');
    this.recordPerPage = 10;
    this.page = 1;
    this.sort = {
        'userData.lastName': -1
    };
    this.queryOptions = {
        limit: parseInt(this.recordPerPage),
        skip: parseInt((this.page - 1) * this.recordPerPage),
        sort: this.sort
    };
    this.autorun(() => {
        this.queryOptions.limit = parseInt(this.getReactively('recordPerPage'));
        this.queryOptions.skip = parseInt((this.getReactively('page') - 1) * this.recordPerPage);
        this.queryOptions.sort = this.getReactively('sort');
    });

    this.subscribe('visitorUsers', ()=> {
        return [this.getReactively('agencyId'), this.getReactively('queryOptions')]
    });

    this.helpers({
        visitors: ()=> {
            return Roles.getUsersInRole('visitor')
        }
    });
});




