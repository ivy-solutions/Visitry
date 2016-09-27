/**
 * Created by sarahcoletti on 4/7/16.
 */
angular.module("visitry.mobile").directive('register', function() {
  return {
    restrict: 'E',
    templateUrl: '/packages/visitrymobile/client/auth/register/register.html',
    controllerAs: 'register',
    controller: function ($scope, $reactive, $state, $ionicPopup, $ionicHistory ) {
      $reactive(this).attach($scope);

      this.credentials = {
        username: '',
        password: '',
        role: 'requester',
        userData: {
          firstName: "",
          lastName: ""
        }
      };

      this.createAccount = (form) => {
        if(form.$valid) {
          Accounts.createUser(this.credentials, (err) => {
            if (err) {
              return handleError(err);
            }
            else {
              var avatarWithInitials = generateAvatar(this.credentials.userData.firstName, this.credentials.userData.lastName);
              Meteor.call('updatePicture', avatarWithInitials,(err) => {
                if (err) {
                  return handleError(err);
                }
                else {
                  Meteor.loginWithPassword(this.credentials.username, this.credentials.password, (err) => {
                    if (err) {
                      return handleError(err)
                    }
                    this.resetForm(form);
                    $state.go('profile');
                  });
                }
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
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        form.$setUntouched();
        form.$setPristine();
        this.credentials.userData.firstName = '';
        this.credentials.userData.lastName ='';
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

        const colors = ["#FFCE98","#FF6F69","#ff9999", "#99ccff", "#cc9966", "#ffffcc", "#cc6699", "#75a3a3" ];

        var WIDTH = 256, HEIGHT = 256;

        var canvas = document.createElement('canvas');
        canvas.id = "avatar";
        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        var ctx = canvas.getContext('2d');
        var colorIndex = new Date().getMilliseconds() % colors.length;
        ctx.fillStyle = colors[colorIndex];
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