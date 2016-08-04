/**
 * Created by sarahcoletti on 4/7/16.
 */
angular.module("visitry.mobile").directive('register', function() {
  return {
    restrict: 'E',
    templateUrl: '/packages/visitrymobile/client/auth/register/register.html',
    controllerAs: 'register',
    controller: function ($scope, $reactive, $state, $ionicPopup ) {
      $reactive(this).attach($scope);

      this.credentials = {
        username: '',
        password: ''
      };
      this.firstName = '';
      this.lastName = '';
      this.role = 'requester';

      this.createAccount = (form) => {
        if(form.$valid) {
          Accounts.createUser(this.credentials, (err) => {
            if (err) {
              return handleError(err);
            }
            else {
              Meteor.call('updateName', this.firstName, this.lastName, this.role, (err) => {
                if (err) return handleError(err);
              });
              var avatarWithInitials = generateAvatar(this.firstName, this.lastName);
              Meteor.call('updatePicture', avatarWithInitials);
              Meteor.loginWithPassword(this.credentials.username, this.credentials.password, (err) => {
                if (err) {
                  return handleError(err)
                }
                this.resetForm(form);
                $state.go('profile');

              });
            }
          })
        }
      };

      this.cancel = function (form) {
        this.resetForm(form);
        $state.go( 'login');
      };

      this.resetForm= function(form) {
        form.$setUntouched();
        form.$setPristine();
        this.firstName = '';
        this.lastName ='';
        this.credentials.username = '';
        this.credentials.password ='';
      };

      function handleError(err) {
        console.log('account save error ', err);

        $ionicPopup.alert({
          title: err.reason || 'Save failed',
          template: 'Please try again',
          okType: 'button-positive button-clear'
        });
      }

      function generateAvatar( firstName, lastName ) {
        var initials = (firstName ? firstName[0]: "")  + (lastName ? lastName[0] : "");

        var WIDTH = 256, HEIGHT = 256;

        var canvas = document.createElement('canvas');
        canvas.id = "avatar";
        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "#FF6F69";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        var _font_size = WIDTH / 2 ;
        ctx.font = 100 +" "+ _font_size +"px sans-serif";

        ctx.textAlign = "center";
        ctx.fillStyle = "#2F2933";
        ctx.fillText(initials, WIDTH / 2, HEIGHT - (HEIGHT / 2) + ( _font_size / 3) + 5 );

        var img = canvas.toDataURL("image/png" );
        return img;
      };

    }
  }
});