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
      .state('pendingVisits', {
        url: '/pendingVisits',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitry-mobile/client/visits/pending-visits/pending-visits.html';
          } else {
            return '/packages/visitry-browser/client/visits/pending-visits/pending-visits.html';
          }
        },
        controller: 'pendingVisitsCtrl as pendingVisits'
      })
      .state('listRequests', {
        url: '/listRequests',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitry-mobile/client/visits/list-requests/list-requests.html';
          } else {
            return '/packages/visitry-browser/client/visits/list-requests/list-requests.html';
          }
        },
        controller: 'listRequestsCtrl as listRequests'
      })
      .state('login', {
        url: '/login',
        template: '<login></login>'
      })
      .state('register', {
        url: '/register',
        template: '<register></register>'
      })
      .state('profile', {
        url: '/profile',
        template: '<profile></profile>'
      });

    $urlRouterProvider.otherwise("/listRequests");
  })
  .run(function ($rootScope, $state) {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      if (error === 'AUTH_REQUIRED')
        $state.go('requestVisit');
    });
  });

