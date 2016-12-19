/**
 * Created by sarahcoletti on 2/17/16.
 */
import { Visit } from '/model/visits'
import {logger} from '/client/logging'

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
    controller: function ($scope, $reactive, $state,$cookies,$ionicHistory,$ionicActionSheet, $timeout, $ionicTabsDelegate) {
      $reactive(this).attach($scope);
      $scope.platform = ionic.Platform.platform();

      var visitsSubscription = this.subscribe('visits');
      this.feedbackOutstanding;

      this.autorun(() => {
        var status = Meteor.status();
        $scope.connectionStatus = (status.connected==true || (status.status!='disconnected' && status.retryCount < 3)) ? 'ok' : status.status;
        if (status.status!=='connected') {
          logger.error( "Lost server connection " + JSON.stringify(status) );
        }
        var feedback = Visit.find({
          visitorFeedbackId: null,
          visitorId: Meteor.userId(),
          visitTime: {$lt: new Date()}
        });
        this.feedbackOutstanding = feedback.count();
      });

      this.helpers({
        userName: ()=> {
          return User.findOne({_id: Meteor.userId()}, {fields: {'username': 1}});
        },
        isLoggedIn: ()=> {
          logger.info('visitry.isLoggedIn as : ' + Meteor.userId());
          return Meteor.userId() !== null;
        }
      });

      this.isRequester = ()=> {
        return Roles.userIsInRole(Meteor.userId(), 'requester')
      };
      this.isVisitor = ()=> {
        return Roles.userIsInRole(Meteor.userId(), 'visitor')
      };

      this.logout = () => {
        logger.info('visitry.logout userId: ' + Meteor.userId());
        Meteor.logout(function (err) {
          if (err) {
            logger.error('visitry.logout ' + err + ' logging user out userId: ' + Meteor.userId());
          }
          else{
            if (visitsSubscription) {
              visitsSubscription.stop();
            }
            if(Meteor.isCordova) {
              $ionicHistory.clearHistory();
              $ionicHistory.clearCache();
            }else{
              $cookies.remove('agencyId');
            }
            $state.go('login',{reload: true, notify:false});
          }
        });
      };

      this.feedbackNeeded = () => {
        return $ionicHistory.currentStateName() === 'requesterFeedback';
      };

      this.showUserActions = ( ) => {
        var profileText = "Profile";
        var notificationsText = "Notifications";
        var agenciesText = "Agencies";
        var signOutText = "Sign Out";
        var cancelText = "Cancel";
        var titleText = "";
        var buttons = [];
        buttons.push( {text: profileText});
        buttons.push( {text: notificationsText});
        if ( this.isVisitor() ) {
          buttons.push({text: agenciesText});
        }
        var logout = this.logout;

        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({

          buttons: buttons,
          destructiveText: signOutText,
          titleText: titleText,
          cancelText: cancelText,
          cancel: function() { //reselect the current tab
            var tabStatesMap = [
              {state: 'pendingVisits', tabNum: 0},
              {state: 'requesterFeedback', tabNum: 0},
              {state: 'browseRequests', tabNum:0},
              {state:'upcoming', tabNum:1},
              {state:'visitorFeedbackList', tabNum: 2}];
            var tabIndex = tabStatesMap.find(
              function (tabState) {
                return (tabState.state === $ionicHistory.currentStateName());
              }
            );
            if (tabIndex) {
              if (Roles.userIsInRole( Meteor.userId(), 'visitor'))
                $ionicTabsDelegate.$getByHandle('visitorTabs').select(tabIndex.tabNum);
              else {
                $ionicTabsDelegate.$getByHandle('requesterTabs').select(tabIndex.tabNum);
              }
            } else {  //not sure where we were
              $ionicTabsDelegate.select(0);
            }
            return true;
          },
          buttonClicked: function(index) {
            if ( buttons[index].text === profileText) {
               $state.go('profile');
            } else if (buttons[index].text === notificationsText) {
              $state.go('notifications');
            } else if (buttons[index].text === agenciesText) {
              $state.go('agencyList');
            }
            return true;
          },
          destructiveButtonClicked: function() {
            logout();
          }
        });

        // Hide the sheet after 15 seconds
        $timeout(function() {
          hideSheet();
        }, 15000);
      };
    }
  }
});