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

      var subscription = this.subscribe('userProfile');
      var subscription2 = this.subscribe('visits');

      this.autorun(() => {
        var status = Meteor.status();
        $scope.connectionStatus = (status.connected==true || (status.status!='disconnected' && status.retryCount < 3)) ? 'ok' : status.status;
        if (status.status!=='connected') {
          logger.error( "Lost server connection " + JSON.stringify(status) );
        }
      });

      this.helpers({
        userName: ()=> {
          return User.findOne({_id: Meteor.userId()}, {fields: {'username': 1}});
        },
        feedbackOutstanding: ()=> {
          var feedback = Visit.find({
            visitorFeedbackId: null,
            visitorId: Meteor.userId(),
            visitTime: {$lt: new Date()}
          });
          return feedback.count();
        },
        isLoggedIn: ()=> {
          logger.info('visitry.isLoggedIn as : ' + Meteor.userId());
          return Meteor.userId() !== null;
        },
        isRequester: ()=> {
          return Meteor.userId !==null  && Roles.userIsInRole(Meteor.userId(), 'requester')
        },
        isVisitor: ()=> {
          return Meteor.userId !==null && Roles.userIsInRole(Meteor.userId(), 'visitor')
        }
      });

      this.logout = () => {
        logger.info('visitry.logout userId: ' + Meteor.userId());
        Meteor.logout(function (err) {
          if (err) {
            logger.error('visitry.logout ' + err + ' logging user out userId: ' + Meteor.userId());
          }
          else{
            subscription.stop();
            subscription2.stop();
            if(Meteor.isCordova) {
              $ionicHistory.clearHistory();
              $ionicHistory.clearCache();
            }else{
              $cookies.remove('agencyId');
            }
            $state.go('login',{reload: true});
          }
        });
      };

      this.feedbackNeeded = () => {
        return $ionicHistory.currentStateName() === 'requesterFeedback';
      }

      this.showRequesterTabs = () => {
        return Meteor.userId() !== null &&
            !Roles.userIsInRole( Meteor.userId(), 'visitor')
      }

      this.showUserActions = ( ) => {
        var profileText = "Profile";
        var notificationsText = "Notifications";
        var signOutText = "Sign Out";
        var cancelText = "Cancel";
        var titleText = "";
        var buttons = [];
        buttons.push( {text: profileText});
        buttons.push( {text: notificationsText});

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
            } else {  //not sure where we are
              $ionicTabsDelegate.select(0);
            }
            return true;
          },
          buttonClicked: function(index) {
            logger.info("user actions:" + index);
            if ( buttons[index].text === profileText) {
              $state.go('profile');
            } else if (buttons[index].text === notificationsText) {
              //TODO show notifications
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