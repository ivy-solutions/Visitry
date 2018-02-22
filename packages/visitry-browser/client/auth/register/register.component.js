/**
 * Created by sarahcoletti on 2/17/16.
 */
import { Roles } from 'meteor/alanning:roles'
import { Accounts } from 'meteor/accounts-base'

angular.module("visitry.browser").directive('register', function () {
  return {
    restrict: 'E',
    templateUrl: '/packages/visitry-browser/client/auth/register/register.html',
    controllerAs: 'register',
    controller: function ($scope, $reactive, $state, $mdDialog, $cookies, $stateParams, UserDetailsDialog) {
      $reactive(this).attach($scope);

      this.agencyId = $cookies.get('agencyId');
      this.credentials = {
        email: '',
        username: '',
        role: $stateParams.role,
        userData: {
          firstName: "",
          lastName: "",
          agencyIds: [this.agencyId],
          phoneNumber: null
        }
      };

      this.createAccount = (form) => {
        if (form.$valid) {
          Meteor.call('createUserFromAdmin', this.credentials, (err, result) => {
            if (err) {
              return handleError(err);
            } else {
              if (result) {  // result is new user id if a new user was created
                var avatarWithInitials = generateAvatar(this.credentials.userData.firstName, this.credentials.userData.lastName);
                Meteor.call('updatePicture',result, avatarWithInitials, (err) => {
                  if (err) {
                    return handleError(err);
                  } else {
                    UserDetailsDialog.open(result);
                    this.cancel(form);
                  }
                });
              } else {
                Meteor.call('getUserByEmail', this.agencyId, this.credentials.email, (err, existingUser) => {
                  if (existingUser) {
                    UserDetailsDialog.open(existingUser);
                  }
                });
                this.cancel(form);
              }
            }
          });
        }
      };

      this.cancel = function (form) {
        this.resetForm(form);
        if ($stateParams.role === 'requester') {
          $state.go('adminManageSeniors', {reload: true});
        } else if ($stateParams.role === 'visitor') {
          $state.go('adminManageVisitors', {reload: true});
        } else if ($stateParams.role === 'administrator') {
          $state.go('adminAdminAgency', {agencyId:this.agencyId});
        } else {
          $state.go('/lost');
        }
      };

      this.resetForm = function (form) {
        form.$setUntouched();
        form.$setPristine();
        this.credentials.userData.firstName = '';
        this.credentials.userData.lastName = '';
        this.credentials.username = '';
        this.credentials.password = '';
        this.credentials.email = '';
      };

      function handleError(err) {
        let title = (err) ? err.reason : 'Save failed';
        console.log('account save error ', err);
        $mdDialog.show(
          $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(title)
            .textContent('Please try again')
            .ok('Got it!')
        );
      }

      function generateAvatar(firstName, lastName) {
        var initials = (firstName ? firstName[0] : "") + (lastName ? lastName[0] : "");

        const colors = ["#FFCE98", "#FF6F69", "#ff9999", "#99ccff", "#cc9966", "#ffffcc", "#cc6699", "#75a3a3"];

        var WIDTH = 256, HEIGHT = 256;

        var canvas = document.createElement('canvas');
        canvas.id = "avatar";
        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        var ctx = canvas.getContext('2d');
        var colorIndex = new Date().getMilliseconds() % colors.length;
        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        var _font_size = WIDTH / 2;
        ctx.font = 100 + " " + _font_size + "px sans-serif";

        ctx.textAlign = "center";
        ctx.fillStyle = "#2F2933";
        ctx.fillText(initials, WIDTH / 2, HEIGHT - (HEIGHT / 2) + ( _font_size / 3) + 5);

        var img = canvas.toDataURL("image/png");
        return img;
      }
    }

  }
});