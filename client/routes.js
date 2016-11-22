/**
 * Created by sarahcoletti on 2/17/16.
 */
import {Visits } from '/model/visits'
import {logger} from '/client/logging'
import {Roles} from 'meteor/alanning:roles'

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
          feedback: function ($q,$state) {
            var deferred = $q.defer();
            const visits = Meteor.subscribe('userRequests', Meteor.userId(),{
              onReady: () => {
                deferred.resolve(visits);
                 const visitNeedingFeedback = Visits.findOne({
                   requesterFeedbackId: null,
                   requesterId: Meteor.userId(),
                   visitTime: {$lt: new Date()}
                 });
                 if (visitNeedingFeedback) {
                   logger.info("Yes, lets go to feedbacks" + visitNeedingFeedback._id);
                   $state.go('requesterFeedback', {visitId: visitNeedingFeedback._id});
                 }
              },
              onStop: deferred.reject
            });
            return deferred.promise;
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

            const available = Meteor.subscribe('availableVisits', [], {
              onReady: () => {deferred.resolve(available)},
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
      })
      .state('adminHome', {
        url: '/admin',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/admin-console/admin-home.html';
          } else {
            return '/packages/visitry-browser/client/admin-console/admin-home.html';
          }
        },
        controller: 'adminHomeCtrl as adminHome',
        resolve: {authenticate:authenticate,checkAgencyIdCookie:updateAgencyIdCookie,
          currentUser: ['$meteor', '$q', function($meteor, $q) {
            return $meteor.requireUser().then(function(user) {
              if(!_.contains(user.roles, 'administrator')) {
                // fail the promise chain
                return $q.reject('FORBIDDEN');
              }
              // keep the success promise chain
              return user;
            });
          }]}
        })
      .state('adminManage', {
        url: '/admin/manage',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/admin-console/manage/manage.html';
          } else {
            return '/packages/visitry-browser/client/admin-console/manage/manage.html';
          }
        },
        controller: 'adminManageCtrl as adminManage',
        resolve: {authenticate:authenticate,checkAgencyIdCookie:updateAgencyIdCookie}
      })
      .state('adminManageSeniors',{
        url: '/admin/manage/seniors',
        templateUrl:()=>{
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/admin-console/manage/manage-seniors.html';
          } else {
            return '/packages/visitry-browser/client/admin-console/manage/manage-seniors.html';
          }
        },
        controller: 'adminManageSeniorsCtrl as adminManageSeniors',
        resolve:{authenticate:authenticate,checkAgencyIdCookie:updateAgencyIdCookie}
      })
      .state('adminManageVisitors',{
        url: '/admin/manage/visitors',
        templateUrl:()=>{
          if (Meteor.isCordova) {
            return 'packages/visitrymobile/client/admin-console/manage/manage-visitors.html';
          } else {
            return 'packages/visitry-browser/client/admin-console/manage/manage-visitors.html';
          }
        },
        controller: 'adminManageVisitorsCtrl as adminManageVisitors',
        resolve:{authenticate:authenticate,checkAgencyIdCookie:updateAgencyIdCookie}
      })
      .state('adminAnalytics', {
        url: '/admin/analytics',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/admin-console/analytics/analytics.html';
          } else {
            return '/packages/visitry-browser/client/admin-console/analytics/analytics.html';
          }
        },
        controller: 'adminAnalyticsCtrl as adminAnalytics',
        resolve: {authenticate:authenticate,checkAgencyIdCookie:updateAgencyIdCookie}
      })
      .state('adminAdmin', {
        url: '/admin/admin',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/admin-console/admin/admin.html';
          } else {
            return '/packages/visitry-browser/client/admin-console/admin/admin.html';
          }
        },
        controller: 'adminAdminCtrl as adminAdmin',
        resolve: {authenticate:authenticate,checkAgencyIdCookie:updateAgencyIdCookie}
      })
      .state('adminHelpOverview', {
        url: '/admin/help',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/admin-console/help/help-overview.html';
          } else {
            return '/packages/visitry-browser/client/admin-console/help/help-overview.html';
          }
        },
        controller: 'adminHelpOverviewCtrl as adminHelpOverview'
      })
      .state('adminHelpAbout', {
        url: '/admin/help/about',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/admin-console/help/help-overview.html';
          } else {
            return '/packages/visitry-browser/client/admin-console/help/help-about.html';
          }
        },
        controller: 'adminHelpAboutCtrl as adminHelpAbout'
      })
     ;
    $urlRouterProvider.otherwise("/login");

    function authenticate($q, $state, $timeout, $cookies,$ionicHistory) {
      if (Meteor.userId()) {
        logger.debug('user is logged in');
        // Resolve the promise successfully
        return $q.resolve()
      } else {
        // The next bit of code is asynchronously tricky.
        $timeout(function () {
          // This code runs after the authentication promise has been rejected.
          logUserOut($cookies,$state,$ionicHistory);
        });
        // Reject the authentication promise to prevent the state from loading
        return $q.reject()
      }
    }
    function updateAgencyIdCookie($q, $timeout,$state, $cookies,$ionicHistory){
      if(!(Meteor.userId())){
        logger.debug('User not logged in');
        $timeout(function () {
          // This code runs after the authentication promise has been rejected.
          logUserOut($cookies,$state,$ionicHistory);
        });
        return $q.reject();
      }
      else if(!$cookies.get('agencyId')){
         var user = User.findOne({_id:Meteor.userId()});
        $cookies.put('agencyId',user.userData.agencyIds[0]);
      }
      return $q.resolve();
    }
    function logUserOut($cookies,$state,$ionicHistory){
      Meteor.logout(function (err) {
        logger.info('Logging user out');
        if (err) {
          logger.error('logUserOut ' + err + ' logging user out userId: ' + Meteor.userId());
        }
        else {
          if (Meteor.isCordova) {
            $ionicHistory.clearHistory();
          } else {
            $cookies.remove('agencyId');
          }
        }
      });
    }
  })
  .run(function ($rootScope, $state) {

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      if (error === 'AUTH_REQUIRED') {
        $state.go('login', {notify:false});
      }
    });
    $rootScope.$on( '$stateChangeStart', function ( event, toState, toParams, fromState, fromParams ) {
      if (toState.name === 'login') {
         if (event && Meteor.userId()) {
           let nextState;
           if (Roles.userIsInRole(Meteor.userId(), ['administrator'])) {
             nextState = 'adminManage';
           }
           else if (Roles.userIsInRole(Meteor.userId(), ['visitor'])) {
             nextState = 'browseRequests';
           } else if (Roles.userIsInRole(Meteor.userId(), ['requester'])) {
             nextState = 'pendingVisits';
           }
           if (nextState) {
             logger.info(nextState);
             event.preventDefault();
             return $state.go(nextState);
           } else {
             logger.error("userId but no user role")
           }
        }
        return;  //go to login page
      }
    });

    Accounts.onLogin(function () {
      // if we are already logged in but on the login page, redirect to role-based appropriate page
      if ($state.is('login')) {
        if (Meteor.userId()) {
          const handle = Meteor.subscribe('userBasics');
          Tracker.autorun(() => {
            if (Meteor.userId()) {
              const isReady = handle.ready();
              if (Roles.userIsInRole(Meteor.userId(), ['administrator'])) {
                $state.go('adminManage');
              }
              else if (Roles.userIsInRole(Meteor.userId(), ['visitor'])) {
                $state.go('browseRequests');
              } else if (Roles.userIsInRole(Meteor.userId(), ['requester'])) {
                $state.go('pendingVisits');
              } else {
                logger.error("user with no role." + Meteor.userId());
              }
            }
          });
          handle.stop();
        }
      }
    });

  });

