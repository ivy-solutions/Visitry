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
            return '/packages/visitrymobile/client/visits/pending-visits/pending-visits.html';
          } else {
            return '/packages/visitry-browser/client/visits/pending-visits/pending-visits.html';
          }
        },
        controller: 'pendingVisitsCtrl as pendingVisits',
        resolve:{
          feedback:function($location){
            const visits = Meteor.subscribe('visits');
            Tracker.autorun(()=>{
              const isReady = visits.ready();
              var visitNeedingFeedback = Visits.findOne({feedbackId:null,requesterId:Meteor.userId(),requestedDate:{$lt:new Date()}});
              if(isReady && visitNeedingFeedback){
                console.log("Yes lets go to feedbacks");
                $location.url('/feedback/'+ visitNeedingFeedback._id);
              }else{
                console.log(`Visits data is ${isReady ? 'ready' : 'not ready'}`)
              }
            })
          }
        }
      })
      .state('browseRequests', {
        url: '/visitor/browseRequests',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/visits/browse-visit-requests/browse-visit-requests.html';
          } else {
            return '/packages/visitry-browser/client/visits/browse-visit-requests/browse-visit-requests.html';
          }
        },
        controller: 'browseVisitRequestsCtrl as browseVisitRequests',
        resolve: {
          available: ['$q', ($q) => {
            var deferred = $q.defer();

            const available = Meteor.subscribe('availableVisits', {
              onReady: deferred.resolve,
              onStop: deferred.reject
            });

            return deferred.promise;
          }]
        }
      })
      .state('upcoming', {
        url: '/visitor/upcoming',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/visits/visitor-view-upcoming/visitor-view-upcoming.html';
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
            return '/packages/visitrymobile/client/visits/visit-details/visit-details.html';
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
            return '/packages/visitrymobile/client/auth/login/login.html';
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
            return '/packages/visitrymobile/client/users/profile.html';
          } else {
            return '/packages/visitry-browser/client/users/profile.html';
          }
        },
        controller: 'profileCtrl as profile'
      })
    .state('feedback',{
      url:'/feedback/:visitId',
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

