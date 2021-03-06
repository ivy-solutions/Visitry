/**
 * Created by Daniel Biales on 1/29/17.
 */
import {Visit, Visits} from '/model/visits'
import {Feedback, Feedbacks} from '/model/feedback'
import {VisitorUsers} from '/model/users'
import {Roles} from 'meteor/alanning:roles'
import {Enrollment} from '/model/enrollment'
import {Agency} from '/model/agencies'
import {logger} from '/client/logging'

angular.module('visitry').controller('userDetailsCtrl', function ($scope, $cookies, $reactive, AdminVisitDetailsDialog, $mdDialog, $ionicPopup) {
  $reactive(this).attach($scope)
  this.userId = this.locals.userId
  this.agencyId = $cookies.get('agencyId')
  this.isEditMode = false;
  //by passing null as agencyId, this covers applicants as well as members
  this.role = () => {
    if (Meteor.myFunctions.isVisitorInAgency(this.getReactively('userId'), null))
      return "Visitor";
    else if (Meteor.myFunctions.isAdministratorInAgency(this.getReactively('userId'), this.agencyId))
      return "Administrator";
    else
      return "Requester";
  }

  this.isVisitor = Meteor.myFunctions.isVisitorInAgency(this.getReactively('userId'), this.agencyId)
  let userdataSubscription = this.subscribe('userdata', () => [], () => {
    this.isVisitor = Meteor.myFunctions.isVisitorInAgency(this.getReactively('userId'), this.agencyId)
  })
  this.subscribe('feedback')
  this.subscribe('agencyVisits', () => {
    return [this.getReactively('agencyId')]
  })
  this.subscribe('visitorUsers', () => {
    return [this.getReactively('agencyId')]
  })
  this.subscribe('memberships', () => {
    return [this.getReactively('userId')]
  })

  this.call('getUserPicture', this.userId, (err, result) => {
    this.userPicture = result
  })

  this.editUserProfile = ()=> {
    this.isEditMode = true;
  };
  this.visitsCount = 0
  this.recordPerPage = 5
  this.page = 1
  this.today = new Date()

  this.completedVisitsCount = 0
  this.pendingVisitsCount = 0
  this.unfilledVisitsCount = 0

  this.autorun(() => {
    let lastMonth = new Date()
    lastMonth = lastMonth.setMonth(lastMonth.getMonth() - 1)
    this.completedVisitsCount = Visits.find({
      'visitTime': {$exists: true, $lt: this.today}, 'inactive': {$exists: false},
      $or: [{requesterId: this.userId}, {visitorId: this.userId}],
      'updatedAt': {$gt: new Date(lastMonth)}
    }).count()
    this.pendingVisitsCount = Visits.find({
      'requestedDate': {$gt: this.today}, 'inactive': {$exists: false},
      $or: [{requesterId: this.userId}, {visitorId: this.userId}],
      'updatedAt': {$gt: new Date(lastMonth)}
    }).count()
    this.unfilledVisitsCount = Visits.find({
      'requestedDate': {$lt: this.today, $gt: new Date(lastMonth)},
      visitTime: {$exists: false},
      'inactive': {$exists: false},
      $or: [{requesterId: this.userId}, {visitorId: this.userId}]
    }).count()
    this.hoursCount = 0
    Feedbacks.find({
      'createdAt': {$gt: new Date(lastMonth)},
      'submitterId': this.userId
    }, {fields: {'timeSpent': 1}}).forEach((feedback) => {
      this.hoursCount += (feedback.timeSpent / 60)
    })
  })


  this.helpers({
    user: () => {
      let queryOptions = {
        fields: {
          username: 1, emails: 1, fullName: 1, createdAt: 1, roles: 1,
          'userData.location': 1, 'userData.locationInfo': 1, 'userData.firstName': 1, 'userData.lastName': 1,
          'userData.about': 1, 'userData.phoneNumber': 1, 'visitorHours': 1, 'visitorRating': 1
        }
      }

      if (this.getReactively('isVisitor')) {
        return VisitorUsers.findOne({_id: this.getReactively('userId')}, queryOptions)
      } else {
        return User.findOne({_id: this.getReactively('userId')}, queryOptions)
      }
    },
    visits: () => {
      this.visitsCount = Visits.find({$or: [{requesterId: this.userId}, {visitorId: this.userId}]}).count()
      return Visits.find({$or: [{requesterId: this.userId}, {visitorId: this.userId}]}, {
        limit: parseInt(this.getReactively('recordPerPage')),
        skip: parseInt((this.getReactively('page') - 1) * this.recordPerPage),
        sort: {requestedDate: -1}
      })
    },
    enrolled: () => {
      let enrollment = Enrollment.findOne({agencyId: this.agencyId, userId: this.userId})
      return enrollment
    }

  })

  this.pageChanged = (newPage) => {
    this.page = newPage
  }

  this.getUserVisitFeedbackRating = (visitId) => {
    let feedback = Feedbacks.findOne({visitId: visitId, submitterId: this.userId})
    return feedback ? feedback.visitRating : 0
  }

  this.getVisitDetails = (visitId) => {
    AdminVisitDetailsDialog.open(visitId)
  }

  this.removeUser = (ev) => {
    let agencyName = Agency.findOne({_id: this.agencyId}).name
    $mdDialog.show(
      {
        controllerAs: 'removeUserConfirmCtrl',
        controller: function ($mdDialog) {
          this.remove = () => {
            $mdDialog.hide()
            Meteor.call('removeUserFromAgency', {userId: this.userId, role: this.role, agencyId: this.agencyId},(err)=>{
              if(err){
                handleError(err)
              }else{
                $mdDialog.cancel()
              }
            })
          }
          this.cancel = () => {
            $mdDialog.hide()
          }
          function handleError(err) {
            let title = (err) ? err.reason : 'Removal failed';
            $mdDialog.show(
              $mdDialog.alert()
                .clickOutsideToClose(true)
                .title(title)
                .textContent('Please try again')
                .ok('OK')
            );
          }
        },
        scope: $scope,
        preserveScope: true,
        bindToController: true,
        locals: {userId: this.userId, role: (this.isVisitor) ? 'visitor' : 'requester', agencyId: this.agencyId},
        targetElement: ev,
        skipHide: true,
        autoWrap: true,
        template: '<md-dialog md-theme="default" aria-label="Remove user confirm" class="confirm"><md-dialog-content class="md-dialog-content"><h2 class="md-title">Are you sure you want to remove {{userDetails.user.fullName}} from ' + agencyName + '?</h2><md-dialog-actions><md-button class="md-warn md-button md-default-theme md-ink-ripple" ng-click="removeUserConfirmCtrl.cancel()">Cancel</md-button><md-button class="md-primary md-button md-default-theme md-ink-ripple" ng-click="removeUserConfirmCtrl.remove()">Remove</md-button></md-dialog-actions></md-dialog-content></md-dialog>'
      }
    )
  }

  this.isLoadingPlaces = false; //true when retrieving info from Google Places

  this.location = {
    address: (this.user && this.user.userData && this.user.userData.location) ? this.user.userData.location.address : "",
    details: null
  };

  this.changeLocation = () => {
    this.isLoadingPlaces = this.location.address && this.location.address.length > 0;
    this.location.details = null;
  };

  this.isLocationValid = ()=> {
    if ( Meteor.userId() !== null ) {
      var hasClearAddress =  !this.location.address || this.location.address.length == 0 ;
      if (hasClearAddress) {
        return true;
      } else {
        var userHasSelectedLocation = this.location.details != null && this.location.address != null && this.location.address.length > 0;
        return userHasSelectedLocation;
      }
    }
    return false;
  };

  this.updateUserProfile = (form) => {
    if(form.$valid && (form.location.$pristine || this.isLocationValid())) {
      if (form.location.$dirty) {
        // location is optional - can be blank or selected
        var newLocation = null;
        if (this.location.address != null && this.location.address.length > 0) {
          if (this.location.details) {
            newLocation = {
              address: this.location.details.name + ", " + this.location.details.vicinity,
              formattedAddress: this.location.details.formatted_address,
              geo: {
                type: "Point",
                coordinates: [this.location.details.geometry.location.lng(), this.location.details.geometry.location.lat()]
              }
            };
          }
        }
        this.user.userData.location = newLocation;
      }
      Meteor.call('updateUserProfile', this.user._id, this.user, this.agencyId, (err) => {
        if (err) {
          return handleError(err);
        }
        $mdDialog.hide();
      })
    }
  };

  function handleError(err) {
    logger.error('userData save error ', err.reason);
    $mdDialog.hide();

    $ionicPopup.alert({
      title: 'Save failed',
      template: err.reason || 'Please try again',
      okType: 'button-positive button-clear'
    });
  }

})
