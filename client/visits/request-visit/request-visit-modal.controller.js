import { Visit } from '/model/visits.js'
import {logger} from '/client/logging'
import {Roles} from 'meteor/alanning:roles'

angular.module('visitry').controller('requestVisitModalCtrl', function ($scope, $reactive, $timeout, $ionicPopup, $window, $cookies,$state, RequestVisit) {
  $reactive(this).attach($scope);

  if(!Meteor.isCordova){
    this.agencyId = $cookies.get('agencyId');
    this.subscribe('seniorUsers', ()=> {
      return [this.getReactively('agencyId')]
    });
  }

  this.searchText = '';
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
  let requester;
  this.fromVisit;
  this.autorun( function() {
    if (this.getReactively('fromVisit')) {
      this.visitRequest.location.name = this.fromVisit.location.address;
      // make the request date on the next day with same day of week and time
      var weekday = moment(this.fromVisit.requestedDate).weekday();
      if (moment().weekday() < weekday) {
         this.visitRequest.date =  moment().day(weekday).hours(0).minutes(0).seconds(0).toDate();
      } else {
        this.visitRequest.date = moment().add(1, 'weeks').day(weekday).hours(0).minutes(0).seconds(0).toDate();
      }
      this.visitRequest.notes = this.fromVisit.notes;
      this.visitRequest.visitorId = this.fromVisit.visitorId;
    }
  });

  this.helpers({
    userLocation: ()=> {
      if(Meteor.isCordova) {
        requester = User.findOne(Meteor.userId())
        if (requester.userData && requester.userData.location) {
          this.visitRequest.location.name = requester.userData.location.address
        }
      }else if(this.getReactively('visitRequest.requesterId')) {
        requester = User.findOne(this.visitRequest.requesterId)
      }
      return requester

    },
    requesters:()=>{
      if(!Meteor.isCordova && this.getReactively('searchText')){
        let nameFilter = this.getReactively('searchText')
        return Roles.getUsersInRole('requester',$cookies.get('agencyId')).fetch().filter((user)=>{
          return Boolean((user.userData.firstName.toLowerCase()+' '+user.userData.lastName.toLowerCase()).includes(nameFilter.toString().toLowerCase()))
        })
      }
    },
    priorVisit:()=>{
      this.fromVisit = Visit.findOne({_id: $scope.fromVisitId});
      return this.fromVisit;
    },
    priorVisitor:()=>{
      var visitor;
      if (this.getReactively('fromVisit')) {
        visitor = User.findOne({_id: this.fromVisit.visitorId});
      }
      return visitor;
    }
  });

  this.changeLocation = () => {
    this.isLoadingPlaces = this.visitRequest.location.name.length > 0;
    this.visitRequest.location.details.geometry = null;
  };

  this.isLocationValid = ()=> {
    if ( this.userSubmitted && requester) {
      //user has selected a location, or has a default location that matches what is on screen
      let hasSelectedLocation = this.visitRequest.location.details.geometry !== null;
      let usingProfileLocation = requester.userData && requester.userData.location != null && requester.userData.location.address === this.visitRequest.location.name;
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
    if (this.userSubmitted ) {
      if (this.fromVisit==null) {
        return Boolean(this.visitRequest.time > 0);
      } else {
        return Boolean(this.fromVisit.visitTime && this.fromVisit.visitTime.getHours() );
      }
    } else {
      return true;
    }
  };
  this.getFullName=(user)=>user.userData.firstName+' '+user.userData.lastName;
  this.onSelectUser = (user)=>{
    if(user) {
      this.visitRequest.requesterId = user._id;
      if (user.userData && user.userData.location && user.userData.location.address) {
        this.visitRequest.location.name = user.userData.location.address
      }
    }
  };

  this.submit = function () {
    this.userSubmitted = true;
    if (this.isLocationValid() && this.isDateValid() && this.isTimeValid() && (Roles.userIsInRole(Meteor.userId(),'administrator',this.agencyId)===Boolean(this.visitRequest.requesterId))) {
      let newVisit = new Visit({
        notes: this.visitRequest.notes,
        requesterId:this.visitRequest.requesterId
      });
      if (this.fromVisit) {
        newVisit.requestedDate = new Date(this.visitRequest.date);
        newVisit.requestedDate.setHours(this.fromVisit.visitTime.getHours());
        newVisit.requestedDate.setMinutes(this.fromVisit.visitTime.getMinutes());
        newVisit.visitorId = this.fromVisit.visitorId;
        newVisit.visitTime = newVisit.requestedDate;
      } else {
        newVisit.requestedDate = new Date(this.visitRequest.date.setHours(this.visitRequest.time));
      }
      //location from selection, from priorVisit, or from user default
      if ( this.visitRequest.location.details.geometry ) {
        newVisit.location = {
          address: this.visitRequest.location.details.name + ", " + this.visitRequest.location.details.vicinity,
          formattedAddress: this.visitRequest.location.details.formatted_address,
          geo: {
            type: "Point",
            coordinates: [this.visitRequest.location.details.geometry.location.lng(), this.visitRequest.location.details.geometry.location.lat()]
          }
        }
      } else if (this.fromVisit) {
        newVisit.location = this.fromVisit.location;

      }else {
        newVisit.location = requester.userData.location;
      }
      Meteor.call('visits.createVisit',newVisit, (err) => {
        if (err) return handleError(err);
      });
      hideRequestVisitModal();
      let requesterAgency = Roles.getGroupsForUser(this.visitRequest.requesterId, 'requester').find( function(agencyId) {
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
