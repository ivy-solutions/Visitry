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
      .state('createVisit',{
        url:'/create-visit',
        templateUrl:()=>{
          if(Meteor.isCordova){
            return '/packages/visitrymobile/client/visits/request-visit/request-visit-modal.html'
          }else{
            return '/packages/visitry-browser/client/visits/request-visit/request-visit.html'
          }
        },
        controller: 'requestVisitModalCtrl as requestVisit'
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
          feedback: function ($q, $state) {
            var deferred = $q.defer();
            const visits = Meteor.subscribe('userRequests', Meteor.userId(), {
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
      .state('repeatRequest', {
        url: '/requester/repeatVisit/:priorVisitId',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/visits/request-visit/repeat-visit.html';
          } else {
            return '/packages/visitry-browser/client/visits/request-visit/repeat-visit.html';
          }
        },
        controller: 'repeatVisitController as repeatVisit'
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

            let currentUser = User.findOne({_id: Meteor.userId()}, {fields: {'userData.agencyIds': 1, 'roles':1 }});
            const available = Meteor.subscribe('availableVisits', [Meteor.userId(), currentUser.hasAgency], {
              onReady: () => {
                deferred.resolve(available)
              },
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
      .state('editVisit', {
        url: '/visits/edit/:visitId',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/visits/visit-details/edit-visit.html';
          } else {
            return '/packages/visitry-browser/client/visits/visit-details/edit-visit.html';
          }
        },
        controller: 'editVisitCtrl as editVisit'
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
        template: ()=> {
          if (Meteor.isCordova) {
            return '<register></register>';
          } else {
            return '<register layout-fill layout-margin></register>';
          }
        },
        params: {
          role: 'visitor'
        }
      })
      .state('resetPassword', {
        url: '/resetPassword',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/auth/reset-password/reset-password.html';
          } else {
            return '/packages/visitry-browser/client/auth/reset-password/reset-password.html';
          }
        },
        controller: 'resetPasswordCtrl as resetpw'
      })
      .state('replacePassword', {
        url: '/replace-password/:token',
        templateUrl: ()=> {
          return '/packages/visitry-browser/client/auth/reset-password/replace-password.html';
        },
        controller: 'replacePasswordCtrl as replacePassword'
      })
      .state('verifyEmail', {
        url: '/verify-email/:token',
        templateUrl: ()=> {
          return '/packages/visitry-browser/client/auth/register/verify-email.html';
        },
        controller: 'verifyEmailCtrl as verifyEmail'
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
      .state('notifications', {
        url: '/notifications',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/users/notifications.html';
          } else {
            return '/packages/visitry-browser/client/users/notifications.html';
          }
        },
        controller: 'notificationsCtrl as notifications'
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
      .state('appFeedback', {
        url: '/help/feedback',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/feedback/app-feedback.html';
          } else {
            return '/packages/visitry-browser/client/admin-console/help/help-feedback.html';
          }
        },
        controller: 'appFeedbackCtrl as appFeedback'
      })
      .state('agencyList', {
        url: '/groups',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/agencies/list/agency-list.html';
          } else {
            return '/packages/visitry-browser/client/agencies/list/agency-list.html';
          }
        },
        controller: 'listAgenciesCtrl as agencies'
      })
      .state('agencyDetails', {
        url: '/groupDetails/:groupId',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/agencies/agency-details/agency-details.html';
          } else {
            return '/packages/visitry-browser/client/agencies/agency-details/agency-details.html';
          }
        },
        controller: 'agencyDetailsCtrl as agencyDetails'
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
        resolve: {
          authenticate: authenticate, checkAgencyIdCookie: updateAgencyIdCookie,
          currentUser: ['$meteor', '$q', function ($meteor, $q, $cookies) {
            return $meteor.requireUser().then(function (user) {
              if (!Roles.getRolesForUser(user,$cookies.get('agencyId'))) {
                // fail the promise chain
                return $q.reject('FORBIDDEN');
              }
              // keep the success promise chain
              return user;
            });
          }]
        }
      })
      .state('adminManage', {
        url: '/admin/manage',
        templateUrl: ()=> {
          return '/packages/visitry-browser/client/admin-console/manage/manage.html';
        },
        controller: 'adminManageCtrl as adminManage',
        resolve: {authenticate: authenticate, checkAgencyIdCookie: updateAgencyIdCookie}
      })
      .state('adminManageSeniors', {
        url: '/admin/manage/seniors',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/admin-console/manage/manage-seniors.html';
          } else {
            return '/packages/visitry-browser/client/admin-console/manage/manage-seniors.html';
          }
        },
        controller: 'adminManageSeniorsCtrl as adminManageSeniors',
        resolve: {authenticate: authenticate, checkAgencyIdCookie: updateAgencyIdCookie}
      })
      .state('adminManageVisitors', {
        url: '/admin/manage/visitors',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return 'packages/visitrymobile/client/admin-console/manage/manage-visitors.html';
          } else {
            return 'packages/visitry-browser/client/admin-console/manage/manage-visitors.html';
          }
        },
        controller: 'adminManageVisitorsCtrl as adminManageVisitors',
        resolve: {authenticate: authenticate, checkAgencyIdCookie: updateAgencyIdCookie}
      })
      .state('adminManageVisits', {
        url: '/admin/manage/visits',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return 'packages/visitrymobile/client/admin-console/manage/manage-visits.html';
          } else {
            return 'packages/visitry-browser/client/admin-console/manage/manage-visits.html';
          }
        },
        controller: 'adminManageVisitsCtrl as adminManageVisits',
        resolve: {authenticate: authenticate, checkAgencyIdCookie: updateAgencyIdCookie}
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
        resolve: {authenticate: authenticate, checkAgencyIdCookie: updateAgencyIdCookie}
      })
      .state('adminAdmin', {
        url: '/admin/administrate',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/admin-console/admin/admin.html';
          } else {
            return '/packages/visitry-browser/client/admin-console/admin/admin.html';
          }
        },
        controller: 'adminAdminCtrl as adminAdmin',
        resolve: {authenticate: authenticate, checkAgencyIdCookie: updateAgencyIdCookie}
      })
      .state('adminAdminAgency', {
        url: '/admin/administrate/agency/:agencyId',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/admin-console/admin/admin-agency.html';
          } else {
            return '/packages/visitry-browser/client/admin-console/admin/admin-agency.html';
          }
        },
        controller: 'adminAdminAgencyCtrl as adminAdminAgency',
        resolve: {authenticate: authenticate, checkAgencyIdCookie: updateAgencyIdCookie}
      })
      /*.state('adminHelpOverview', {
        url: '/admin/help',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/admin-console/help/help-overview.html';
          } else {
            return '/packages/visitry-browser/client/admin-console/help/help-overview.html';
          }
        },
        controller: 'adminHelpOverviewCtrl as adminHelpOverview'
      })*/
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
      .state('adminHelpHowTo', {
        url: '/admin/help/howto',
        templateUrl: ()=> {
          if (Meteor.isCordova) {
            return '/packages/visitrymobile/client/admin-console/help/help-how-to.html';
          } else {
            return '/packages/visitry-browser/client/admin-console/help/help-how-to.html';
          }
        },
        controller: 'adminHelpHowToCtrl as adminHelpHowTo'
      })
    .state('adminBrowseToDashboard', {
      url: '/admin/browse',
      templateUrl: ()=> {
        if (Meteor.isCordova) {
          return '/packages/visitrymobile/client/admin-console/browse-to-dashboard.html';
        }
      },
      controller: 'adminBrowseToDashboardCtrl as adminBrowse'
    });
    $urlRouterProvider.otherwise("/login");

    function authenticate($q, $state, $timeout, $cookies, $ionicHistory) {
      if (Meteor.userId()) {
        logger.debug('user is logged in');
        // Resolve the promise successfully
        return $q.resolve()
      } else {
        // The next bit of code is asynchronously tricky.
        $timeout(function () {
          // This code runs after the authentication promise has been rejected.
          logUserOut($cookies, $state, $ionicHistory);
        });
        // Reject the authentication promise to prevent the state from loading
        return $q.reject()
      }
    }

    function updateAgencyIdCookie($q, $timeout, $state, $cookies, $ionicHistory) {
      if (!(Meteor.userId())) {
        logger.debug('User not logged in');
        $timeout(function () {
          // This code runs after the authentication promise has been rejected.
          logUserOut($cookies, $state, $ionicHistory);
        });
        return $q.reject();
      }
      else if (!$cookies.get('agencyId')) {
        var user = User.findOne({_id: Meteor.userId()});
        $cookies.put('agencyId', user.userData.agencyIds[0]);
        return $q.resolve();
      } else {
        return $q.resolve();
      }

    }

    function logUserOut($cookies, $state, $ionicHistory) {
      Meteor.logout(function (err) {
        logger.info('Logging user out');
        if (err) {
          logger.error('logUserOut ' + err + ' logging user out userId: ' + Meteor.userId());
        }
        else {
          if (Meteor.isCordova) {
            $ionicHistory.clearHistory();
          }
          $cookies.remove('agencyId');
          $state.go('login');
        }
      });
    }
  })
  .run(function ($rootScope, $state, $window, $location,$cookies) {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      if (error === 'AUTH_REQUIRED') {
        logger.info("AUTH_REQUIRED" + toState.name );
        $state.go('login', {notify: false});
      }
    });
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      logger.info( fromState.name + " to " + toState.name );
      if (toState.name === 'login') {
        if (event && Meteor.userId()) {
          logger.info("redirect from $stateChangeStart");
          let nextState;
          if (Meteor.myFunctions.isAdministrator() ) {
            if (!Meteor.isCordova) {
              nextState = 'adminManage';
            } else {
              nextState = 'adminBrowseToDashboard';
            }
          }
          else if (Meteor.myFunctions.isVisitor()) {
            nextState = 'browseRequests';
          } else if (Meteor.myFunctions.isRequester()) {
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
/*    $rootScope.$on('$stateNotFound',(event,unfoundState,fromState,fromParams)=>{
      event.preventDefault()
      $state.go('login');
    });*/

    //google analytics
    if (Meteor.settings && Meteor.settings.public && Meteor.settings.public.googleAnalytics) {
      $window.ga('create', Meteor.settings.public.googleAnalytics.trackingId, 'auto');
      if (Meteor.isCordova) {
        cordova.getAppVersion.getAppName(function (name) {
          $window.ga('set', 'appName', name);
        });
        cordova.getAppVersion.getVersionNumber(function (version) {
          $window.ga('set', 'appVersion', version);
        });
      } else {
        $window.ga('set', 'appName', 'Visitry-Admin');
      }
    }

    $rootScope.$on('$stateChangeSuccess', function (event) {
      if (!$window.ga)
        return;
      let agency = $cookies.get('agencyId');
      $window.ga('set', 'dimension1', agency);
      // remove the id if the path is e.g. /visits/id
      let path = $location.path();
      let lastIndex = path.lastIndexOf('/');
      let lastPart = path.slice(lastIndex+1);
      if (lastPart.match(/[0-9a-zA-Z]{17}/)) {
        path = path.slice(0,lastIndex)
      }
      $window.ga('send', 'screenview', {screenName: path});
    });

    Accounts.onLogin(function () {
      // if we are already logged in but on the login page, redirect to role-based appropriate page
      if ($state.is('login')) {
        if (Meteor.userId()) {
          logger.info("redirect from Accounts.onLogin");
          const handle = Meteor.subscribe('userBasics', {}, {
            onReady: ()=> {
              let location = '/lost';
              if (Meteor.myFunctions.isAdministrator() ) {
                if (!Meteor.isCordova) {
                  location = 'adminManage';
                } else {
                  location = 'adminBrowseToDashboard';
                }
              }
              else {
                if (Meteor.myFunctions.isVisitor()) {
                  location = 'browseRequests'
                } else if (Meteor.myFunctions.isRequester()) {
                  location = 'pendingVisits';
                } else {
                  logger.error("user with no role." + Meteor.userId())
                }
              }
              handle.stop();
              $state.go(location);
            }
          });

        }
      }
    });
  });