/**
 * Created by sarahcoletti on 4/7/16.
 */
angular.module("visitry.mobile").directive('register', function () {
  return {
    restrict: 'E',
    templateUrl: '/packages/visitrymobile/client/auth/register/register.html',
    controllerAs: 'register',
    controller: function ($scope, $reactive, $state, $ionicPopup, $ionicHistory) {
      $reactive(this).attach($scope);

      this.credentials = {
        email: '',
        username: '',
        password: '',
        role: 'requester',
        userData: {
          firstName: "",
          lastName: ""
        }
      };

      this.createAccount = (form) => {
        if (form.$valid) {
          // use email as username if no username provided
          if (this.credentials.username.length < 1) {
            this.credentials.username = this.credentials.email
          }
          //createUser logs user on, if successful
          Accounts.createUser(this.credentials, (err, result) => {
            if (err) {
              return handleError(err);
            }
            else {
              var avatarWithInitials = generateAvatar(this.credentials.userData.firstName, this.credentials.userData.lastName);
              Meteor.call('updatePicture', Meteor.userId(), avatarWithInitials, (err) => {
                if (err) {
                  return handleError(err);
                }
                else {
                  this.resetForm(form);
                  $state.go('agencyList');
                }
              });
            }
          })
        }
      };

      this.cancel = function (form) {
        this.resetForm(form);
        if (Meteor.userId()) {
          Meteor.logout();
        }
        $state.go('login', {notify: false});
      };

      this.resetForm = function (form) {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        form.$setUntouched();
        form.$setPristine();
        this.credentials.userData.firstName = '';
        this.credentials.userData.lastName = '';
        this.credentials.username = '';
        this.credentials.password = '';
        this.credentials.email = '';
      };

      function handleError(err) {
        console.log('account save error ', err);

        $ionicPopup.alert({
          title: err.reason || 'Save failed',
          template: 'Please try again',
          okType: 'button-positive button-clear'
        });
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
      };

    }
  }
});