/**
 * Created by sarahcoletti on 2/17/16.
 */
import { Visit } from '/model/visits'
import {logger} from '/client/logging'
import { Notification, NotificationStatus } from '/model/notifications'

angular.module('visitry').directive('visitry', function () {
  return {
    restrict: 'E',
    templateUrl: () => {
      if (Meteor.isCordova) {
        return '/packages/visitrymobile/client/visitry/visitry.html';
      } else {
        return '/packages/visitry-browser/client/visitry/visitry.html';
      }
    },
    controllerAs: 'visitry',
    controller: function ($scope, $reactive, $state, $cookies, $ionicHistory, $ionicActionSheet, $timeout, $ionicTabsDelegate) {
      $reactive(this).attach($scope);
      $scope.platform = ionic.Platform.platform();
      this.isAgencyDataLoaded = false;
      let allAgencySubscription = this.subscribe('allAgencies', ()=> {
        return [ {reactive: Meteor.myFunctions.isAdministrator()}] }, ()=> {
        this.isAgencyDataLoaded = true;
      });
      this.subscribe('visits');
      this.subscribe('receivedNotifications');

      this.feedbackOutstanding;

      this.autorun(() => {
        if (Meteor.isCordova) {
          var status = Meteor.status();
          $scope.connectionStatus = (status.connected == true || (status.status != 'disconnected' && status.retryCount < 3)) ? 'ok' : status.status;
          if (status.status !== 'connected') {
            if ($scope.connectionStatus !== 'ok') {
              window.plugins.toast.showShortBottom('No connection to server. (' + $scope.connectionStatus + ')');
            }
            logger.error("Lost server connection " + JSON.stringify(status));
          }
          //recent notification
          let secondsAgo = moment(Date.now()).add(-5, 's').toDate();
          let notifications =  Notification.find({toUserId: Meteor.userId(), status: NotificationStatus.SENT, updatedAt: {$gt: secondsAgo}});
          if ( notifications.count() > 0 ) {
            let notification = notifications.fetch();
            window.plugins.toast.showShortTop(notification[0].text);
          }
        }

        if (Meteor.userId()) {
          if ($cookies.get('agencyId')) {
            this.agencyId = $cookies.get('agencyId');
          }
          else {
            if (Meteor.user() && Meteor.user().userData && Meteor.user().userData.agencyIds) {
              this.agencyId = Meteor.user().userData.agencyIds[0];
            } else {
              this.agencyId = null;
            }
          }
        }
        var feedback = Visit.find({
          visitorFeedbackId: null,
          visitorId: Meteor.userId(),
          visitTime: {$lt: new Date()}
        });
        this.feedbackOutstanding = feedback.count();
        this.isAgencyDataLoaded = allAgencySubscription.ready();

      });


      this.helpers({
        userName: ()=> {
          return User.findOne({_id: Meteor.userId()}, {fields: {'username': 1, 'userData.agencyIds': 1}});
        },
        isLoggedIn: ()=> {
          logger.info('visitry.isLoggedIn as : ' + Meteor.userId());
          return Meteor.userId() !== null;
        },
        getAgency: ()=> {
          if (Meteor.userId() && this.getReactively('agencyId') && this.getReactively('isAgencyDataLoaded')) {
            this.call('getAgency', this.getReactively('agencyId'), (error, result) => {
              if (error) {
                logger.error(error);
              }
              else {
                this.agency = result;
              }
            });
          }
        },
      });

      this.isRequester = ()=> {
        return Meteor.myFunctions.isRequester();
      };
      this.isVisitor = ()=> {
        return Meteor.myFunctions.isVisitor();
      };
      this.isAdministrator = ()=> {
        return Meteor.myFunctions.isAdministrator();
      };
      this.isSuperUser = () => {
        return Meteor.myFunctions.isAdministratorInAgency(Meteor.userId(), "allAgencies");
      };
      this.logout = () => {
        logger.info('visitry.logout userId: ' + Meteor.userId());
        Meteor.logout(function (err) {
          if (err) {
            logger.error('visitry.logout ' + err + ' logging user out userId: ' + Meteor.userId());
          }
          else {
            if (Meteor.isCordova) {
              $ionicHistory.clearHistory();
              $ionicHistory.clearCache();
            }
            $cookies.remove('agencyId');
            $state.go('login', {reload: true, notify: false});
          }
        });
      };

      this.feedbackNeeded = () => {
         return $ionicHistory.currentStateName() === 'requesterFeedback';
      };

      this.showUserActions = () => {
        var profileText = "Profile";
        var notificationsText = "Notifications";
        var appFeedbackText = "Send App Feedback";
        var signOutText = "Sign Out";
        var cancelText = "Cancel";
        var titleText = "";
        var buttons = [];
        buttons.push({text: profileText});
        buttons.push({text: notificationsText});
        buttons.push({text: appFeedbackText});
        var logout = this.logout;

        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({

          buttons: buttons,
          destructiveText: signOutText,
          titleText: titleText,
          cancelText: cancelText,
          cancel: function () { //reselect the current tab
            var tabStatesMap = [
              {state: 'pendingVisits', tabNum: 0},
              {state: 'requesterFeedback', tabNum: 0},
              {state: 'browseRequests', tabNum: 0},
              {state: 'upcoming', tabNum: 1},
              {state: 'visitorFeedbackList', tabNum: 2}];
            var tabIndex = tabStatesMap.find(
              function (tabState) {
                return (tabState.state === $ionicHistory.currentStateName());
              }
            );
            if (tabIndex) {
              if (Meteor.myFunctions.isVisitor())
                $ionicTabsDelegate.$getByHandle('visitorTabs').select(tabIndex.tabNum);
              else {
                $ionicTabsDelegate.$getByHandle('requesterTabs').select(tabIndex.tabNum);
              }
            } else {  //not sure where we were
              $ionicTabsDelegate.select(0);
            }
            return true;
          },
          buttonClicked: function (index) {
            if (buttons[index].text === profileText) {
              $state.go('profile');
            } else if (buttons[index].text === notificationsText) {
              $state.go('notifications');
            } else if (buttons[index].text === appFeedbackText) {
              $state.go('appFeedback');
            }
            return true;
          },
          destructiveButtonClicked: function () {
            logout();
          }
        });

        // Hide the sheet after 15 seconds
        $timeout(function () {
          hideSheet();
        }, 15000);
      };
    }
  }
});