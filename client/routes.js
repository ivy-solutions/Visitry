/**
 * Created by sarahcoletti on 2/17/16.
 */
angular.module('visitry')
  .config(function ($urlRouterProvider, $stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('visits', {
        url: '/visits',
        template: '<list-visits></list-visits>'
      })
      .state('requestVisit', {
        url: '/requestVisit',
        template: '<pending-visit></pending-visit>'
      })
      .state('login', {
        url: '/login',
        template: '<login></login>'
      })
      .state('register', {
        url: '/register',
        template: '<register></register>'
      });

    $urlRouterProvider.otherwise("/requestVisit");
  })
  .run( function ($rootScope, $state) {
    $rootScope.$on( '$stateChangeError', function (event, toState, toParams, fromState, fromParams, error ) {
      if (error === 'AUTH_REQUIRED')
        $state.go('requestVisit');
    });
});

