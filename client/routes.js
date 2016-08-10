/**
 * Created by sarahcoletti on 2/17/16.
 */
import {Visits } from '/model/visits'
import {User} from '/model/users'

angular.module('visitry')
  .config(function ($urlRouterProvider, $stateProvider, $locationProvider) {
    $locationProvider.html5Mode({enabled: true, requireBase: false}); //TODO: we may want to remove the requireBase attribute

    $stateProvider
      .state('visits', {
        url: '/visits',
        template: '<list-visits></list-visits>'
      })
      .state('pendingVisits', {
        url: '/requester/pendingVisits',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/visits/pending-visits/pending-visits.html';
          } else {
            return '/packages/visitry-browser/client/visits/pending-visits/pending-visits.html';
          }
        },
        controller: 'pendingVisitsCtrl as pendingVisits',
        resolve: {
          feedback: function ($location) {
            const visits = Meteor.subscribe('userRequests');
            Tracker.autorun(()=> {
              const isReady = visits.ready();
              var visitNeedingFeedback = Visits.findOne({
                requesterFeedbackId: null,
                requesterId: Meteor.userId(),
                visitTime: {$lt: new Date()}
              });
              if (isReady && visitNeedingFeedback) {
                console.log("Yes lets go to feedbacks");
                $location.url('/requester/feedback/' + visitNeedingFeedback._id);
              } else {
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
        controller: 'loginCtrl as login',
        resolve: {
          loggedIn: function ($location) {
            if (Meteor.userId()) {
              var profile = Meteor.subscribe('userProfile');
              var user = User.findOne({_id: Meteor.userId()}, {fields: {'userData.role': 1}});
              if ( user ) {
                console.log('There was a user id : ' + JSON.stringify(user));
                switch (user.userData.role) {
                  case 'visitor':
                    console.log('visitor');
                    $location.url('/visitor/browseRequests');
                    break;
                  case 'requester':
                    console.log('requester');
                    $location.url('/requester/pendingVisits');
                    break;
                  default:
                    console.log('invalid role');
                    break;
                }
              }
              else {
                console.log ("no user");
              }
            }
          }
        }
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
      .state('requesterFeedback', {
        url: '/requester/feedback/:visitId',
        template: '<feedback></feedback>'
      })
      .state('visitorFeedbackList', {
        url: '/visitor/feedback',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/feedback/visitor-feedback-list.html';
          } else {
            return '/packages/visitry-browser/client/feedback/visitor-feedback-list.html';
          }
        },
        controller: 'visitorFeedbackList as feedbackList'
      })
      .state('visitorFeedback', {
        url: '/visitor/feedback/:visitId',
        template: '<feedback></feedback>'
      })
      .state('agencyList', {
        url: '/agencies',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/agencies/list/agency-list.html';
          } else {
            return '/packages/visitry-browser/client/agencies/list/agency-list.html';
          }
        },
        controller: 'listAgenciesCtrl as agencies'
      });

    $urlRouterProvider.otherwise("/login");
  })
  .run(function ($rootScope, $state) {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      if (error === 'AUTH_REQUIRED') {
        $state.go('login');
      }
    });
  });

