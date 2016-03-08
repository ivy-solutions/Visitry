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
        controller: 'pendingVisitsCtrl as pendingVisits',
        resolve:{
          feedback:function($location){
            //TODO: if(visits.find({feedbackId:null,requesterId:Meteor.UserId()}).count())
            //var visitId="";
            //$location.url('/visits/'+visitId+'/feedback');
          }
        }
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
      .state('upcoming', {
        url: '/visits/upcoming',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitry-mobile/client/visits/list-requests/list-upcoming.html';
          } else {
            return '/packages/visitry-browser/client/visits/list-requests/list-upcoming.html';
          }
        },
        controller: 'listRequestsCtrl as listRequests'
      })
      .state('visitDetails', {
        url: '/visits/:visitId',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitry-mobile/client/visits/visit-details/visit-details.html';
          } else {
            return '/packages/visitry-browser/client/visits/visit-details/visit-details.html';
          }
        },
        controller: 'visitDetailsCtrl as visitDetails'
      })
      .state('login', {
        url: '/login',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitry-mobile/client/auth/login/login.html';
          } else {
            return '/packages/visitry-browser/client/auth/login/login.html';
          }
        },
        controller: 'loginCtrl as login'
      })
      .state('register', {
        url: '/register',
        template: '<register></register>'
      })
      .state('profile', {
        url: '/profile',
        template: '<profile></profile>'
      })
    .state('visits.feedback',{
      url:'/visits/:visitId/feedback',
      template:'<feedback></feedback>'
    });

    $urlRouterProvider.otherwise("/pendingVisits");
  })
  .run(function ($rootScope, $state) {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      if (error === 'AUTH_REQUIRED')
        $state.go('requestVisit');
    });
  });

