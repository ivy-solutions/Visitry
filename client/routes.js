/**
 * Created by sarahcoletti on 2/17/16.
 */
angular.module('visitry')
  .config(function ($urlRouterProvider, $stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitry-mobile/client/home/home.html';
          } else {
            return '/packages/visitry-browser/client/home/home.html';
          }
        },
        controller: 'homeCtrl as home'
      })
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
      .state('browseRequests', {
        url: '/visitor/browseRequests',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitry-mobile/client/visits/browse-visit-requests/browse-visit-requests.html';
          } else {
            return '/packages/visitry-browser/client/visits/browse-visit-requests/browse-visit-requests.html';
          }
        },
        controller: 'browseVisitRequestsCtrl as browseVisitRequests'
      })
      .state('upcoming', {
        url: '/visitor/upcoming',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitry-mobile/client/visits/visitor-view-upcoming/visitor-view-upcoming.html';
          } else {
            return '/packages/visitry-browser/client/visits/visitor-view-upcoming/visitor-view-upcoming.html';
          }
        },
        controller: 'visitorViewUpcomingCtrl as visitorViewUpcoming'
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
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitry-mobile/client/users/profile.html';
          } else {
            return '/packages/visitry-browser/client/users/profile.html';
          }
        },
        controller: 'profileCtrl as profile'
      })
    .state('feedback',{
      url:'/feedback',
      template:'<feedback></feedback>'
    });

    $urlRouterProvider.otherwise("/login");
  })
  .run(function ($rootScope, $state) {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      if (error === 'AUTH_REQUIRED')
        $state.go('login');
    });
  });

