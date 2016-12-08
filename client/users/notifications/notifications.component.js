/**
 * Created by sarahcoletti on 12/8/16.
 */
import {logger} from '/client/logging'
import { Notification, NotificationStatus } from '/model/notifications'


angular.module('visitry').directive('notifications', function () {
  return {
    restrict: 'E',
    templateUrl: ()=> {
      if (Meteor.isCordova) {
        return '/packages/visitrymobile/client/users/notifications.html';
      } else {
        return '/packages/visitry-browser/client/users/notifications.html';
      }
    },
    controllerAs: 'notifications',
    controller: function ($scope, $reactive, $state, $stateParams) {
      $reactive(this).attach($scope);

      this.subscribe('receivedNotifications');

      this.numMessages = 0;

      this.helpers({
        messages: ()=> {
          var myMessages = Notification.find({toUserId: Meteor.userId(), status: NotificationStatus.SENT});
          this.numMessages = myMessages.count();
          return myMessages;
        }
      });
    }
  }
});

