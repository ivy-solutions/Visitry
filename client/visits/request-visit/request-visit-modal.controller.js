import { Visit } from '/model/visits.js'
import {logger} from '/client/logging'
import {Roles} from 'meteor/alanning:roles'

angular.module('visitry').controller('requestVisitModalCtrl', function ($scope, $reactive, $timeout, $ionicPopup, $window, $cookies,$state, RequestVisit) {
  $reactive(this).attach($scope);

  if(!Meteor.isCordova){
    this.agencyId = $cookies.get('agencyId')
    this.subscribe('seniorUsers', ()=> {
      return [this.getReactively('agencyId')]
    });
  }
  this.searchText = ''
  this.visitRequest = {
    location: {
      name: '',
      details: {}
    },
    date: moment().add(1,'days').hours(0).minutes(0).seconds(0).toDate(),
    time: 0,
    notes: ''
  };
  this.autoCompleteOptions = {
    watchEnter: true,
    country: 'us'
  };
  this.isLoadingPlaces = false; //true when retrieving info from Google Places

  this.userSubmitted = false;
  let currentUser;

  this.helpers({
    userLocation: ()=> {
      if(Meteor.isCordova) {
        currentUser = User.findOne(Meteor.userId())
        if (currentUser.userData && currentUser.userData.location) {
          this.visitRequest.location.name = currentUser.userData.location.address
        }
      }else if(this.getReactively('visitRequest.requesterId')) {
        currentUser = User.findOne(this.visitRequest.requesterId)
      }
      return currentUser

    },
    requesters:()=>{
      if(!Meteor.isCordova && this.getReactively('searchText')){
        let nameFilter = this.getReactively('searchText')
        return Roles.getUsersInRole('requester',$cookies.get('agencyId')).fetch().filter((user)=>{
          return Boolean((user.userData.firstName.toLowerCase()+' '+user.userData.lastName.toLowerCase()).includes(nameFilter.toString().toLowerCase()))
        })
      }
    }
  });

  this.changeLocation = () => {
    this.isLoadingPlaces = this.visitRequest.location.name.length > 0;
    this.visitRequest.location.details.geometry = null;
  };

  this.isLocationValid = ()=> {
    if ( this.userSubmitted && currentUser) {
      //user has selected a location, or has a default location that matches what is on screen
      let hasSelectedLocation = this.visitRequest.location.details.geometry !== null;
      let usingProfileLocation = currentUser.userData && currentUser.userData.location != null && currentUser.userData.location.address === this.visitRequest.location.name;
      return this.visitRequest.location.name.length > 0 && (
        hasSelectedLocation || usingProfileLocation)
    } else {
      return true;
    }
  };
  this.isDateValid = ()=> {
    if (this.userSubmitted) {
      return Boolean(this.visitRequest.date && this.visitRequest.date > new Date())
    } else {
      return true;
    }
  };
  this.isTimeValid = ()=> {
    if (this.userSubmitted) {
      return Boolean(this.visitRequest.time > 0);
    } else {
      return true;
    }
  };
  this.getFullName=(user)=>user.userData.firstName+' '+user.userData.lastName
  this.onSelectUser = (user)=>{
    if(user) {
      this.visitRequest.requesterId = user._id
      if (user.userData && user.userData.location && user.userData.location.address) {
        this.visitRequest.location.name = user.userData.location.address
      }
    }
  }

  this.submit = function () {
    this.userSubmitted = true;
    if (this.isLocationValid() && this.isDateValid() && this.isTimeValid() && (Roles.userIsInRole(Meteor.userId(),'administrator',this.agencyId)===Boolean(this.visitRequest.requesterId))) {
      let newVisit = new Visit({
        requestedDate: new Date(this.visitRequest.date.setHours(this.visitRequest.time)),
        notes: this.visitRequest.notes,
        requesterId:this.visitRequest.requesterId
      });
      //location from selection or from user default
      if ( this.visitRequest.location.details.geometry ) {
        newVisit.location = {
          address: this.visitRequest.location.details.name + ", " + this.visitRequest.location.details.vicinity,
          formattedAddress: this.visitRequest.location.details.formatted_address,
          geo: {
            type: "Point",
            coordinates: [this.visitRequest.location.details.geometry.location.lng(), this.visitRequest.location.details.geometry.location.lat()]
          }
        }
      } else {
        newVisit.location = currentUser.userData.location;
      }
      Meteor.call('visits.createVisit',newVisit, (err) => {
        if (err) return handleError(err);
      });
      hideRequestVisitModal();
      let requesterAgency = Roles.getGroupsForUser(Meteor.userId(), 'requester').find( function(agencyId) {
        return agencyId !== 'noagency';
      });
      if ($window.ga) { //google analytics
        $window.ga('send', {
          hitType: 'event',
          eventCategory: 'Visit',
          eventAction: 'request',
          dimension1: requesterAgency
        });
      }
    }
  };
  this.cancel = function () {
    this.location = { name:{}, details:{}}
    hideRequestVisitModal();
  };

  function hideRequestVisitModal() {
    //remove the blocks google added
    let container = document.getElementsByClassName('pac-container');
    angular.element(container).remove();
    if(Meteor.isCordova){
      RequestVisit.hideModal();
    }else{
      $state.go('adminManageVisits')
    }
  }

  function handleError(err) {
    logger.error('new visit request save error ', err);

    $ionicPopup.alert({
      title: 'Submit failed',
      template: err.reason,
      okType: 'button-positive button-clear'
    });
  }

});
