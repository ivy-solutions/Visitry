/**
 * Created by Daniel Biales on 8/9/16.
 */
import { Visit } from '/model/visits'
import {TopVisitors} from '/model/users'
import { logger } from '/client/logging'


angular.module('visitry.browser').controller('adminManageCtrl', function ($scope, $state, $reactive, $cookies, $mdDialog, AdminVisitDetailsDialog, UserDetailsDialog, ChooseAgencyDialog) {
  $reactive(this).attach($scope);

  this.topVisitorsDayRange = 365;
  this.agencyId = $cookies.get('agencyId');
  this.isTopVisitorsReady = false;
  this.isFrequentVisitorsReady = false;
  this.applicantsCount = -1;
  this.freqVisitors = [];

  let visitsSubscription = this.subscribe('agencyVisits', ()=> {
    return [this.getReactively('agencyId')]
  }, ()=> {
    this.isVisitDataReady = true;
  });
  let userDataSubscription = this.subscribe('userdata', ()=>[], ()=> {
    this.isUserDataReady = true;
  });

  this.autorun(()=> {
    this.isUserDataReady = userDataSubscription.ready();
    this.isVisitDataReady = visitsSubscription.ready();
  });


  this.subscribe('topVisitors', ()=> {
      return [this.getReactively('agencyId'), this.getReactively('topVisitorsDayRange')]
    }, ()=> {
      this.isTopVisitorsReady = true;
    }
  );

  this.helpers({
    getAgency: ()=> {
      if (Meteor.userId() && this.getReactively('agencyId')) {
        this.call('getAgency', this.getReactively('agencyId'), (error, result) => {
          if (error) {
            logger.error(error);
          }
          else {
            this.agency = result;
          }
        });
      }
    },
    scheduledVisits: ()=> {
      let isAllDataThere = this.getReactively('isVisitDataReady') && this.getReactively('isUserDataReady');
      let selector = {
        'visitTime': {$exists: true, $gt: new Date()},
        'agencyId': {$eq: this.getReactively('agencyId')}
      };
      var visits = Visit.find(selector, {
        sort: {visitTime: 1}, limit: 10
      });
      return Meteor.myFunctions.groupVisitsByRequestedDate(visits);
    },
    outstandingRequests: ()=> {
      let isAllDataThere = this.getReactively('isUserDataReady');
      let selector = {
        'visitTime': {$eq: null},
        'requestedDate':{$gt:new Date()},
        'agencyId': {$eq: this.getReactively('agencyId')}
      };
      var visits = Visit.find(selector, {sort: {requestedDate: 1}, limit: 10});
      return Meteor.myFunctions.groupVisitsByRequestedDate(visits);
    },
    applicants: ()=> {
      let isDataThere = this.getReactively('isUserDataReady');
      let selector = {
        'userData.prospectiveAgencyIds': this.getReactively('agencyId')
      };
      return User.find(selector, {
        fields: {
          'userData.firstName': 1,
          'userData.lastName': 1,
          'userData.prospectiveAgencyIds': 1,
          'userData.picture': 1,
          'createdAt': 1,
          'userData.about': 1,
          'userData.location': 1,
          'emails': 1
        }
      });
    },
    topVisitors: ()=> {
      return TopVisitors.find({}, {sort: {visitCount: -1}, limit: 10});
    },
    frequentVisitors: () => {
      var visitorIds = [];
      var users;
      this.call('visitorsByFrequency', this.getReactively('agencyId'), this.getReactively('topVisitorsDayRange'), (error, visitorFrequency) => {
        if (error)
          logger.error(error);
        else {
          this.freqVisitors = visitorFrequency.map(function (visitFreq) {
            var visitor = Meteor.users.findOne({_id: visitFreq._id.visitorId}, {userData: 1});
            visitor.visitCount = visitFreq.numVisits;
            return visitor;
          });
          this.isFrequentVisitorsReady = true;
        }
      });
    }
  });

  this.getUser = Meteor.myFunctions.getUser;
  this.getUserImage = Meteor.myFunctions.getUserImage;

  this.confirmUser = (userId)=> {
    this.call('addUserToAgency', {userId: userId, agencyId: this.agencyId}, (err)=> {
      if (err) {
        logger.error('Failed to add ' + userId + ' to ' + this.agencyId);
        return handleError(err);
      }
    });
  };

  this.getVisitDetails = (visitId)=> {
    AdminVisitDetailsDialog.open(visitId);
  };

  this.getUserDetails = (userId)=> {
    UserDetailsDialog.open(userId);
  };

  this.administersMultipleAgencies = () => {
    return Meteor.myFunctions.administersMultipleAgencies();
  };

  this.switchAgency = () => {
    ChooseAgencyDialog.open(this.updateAgencyCookie);
  };
  this.updateAgencyCookie = () =>{
    this.agencyId = $cookies.get('agencyId');
  };

  function handleError(err) {
    let title = (err) ? err.reason : 'Confirmation failed';
    $mdDialog.show(
      $mdDialog.alert()
        .clickOutsideToClose(true)
        .title(title)
        .textContent('Please try again')
        .ok('OK')
    );
  }
});