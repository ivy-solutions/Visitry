/**
 * Created by Daniel Biales on 8/9/16.
 */
import { Visit } from '/model/visits'
import {Enrollment} from '/model/enrollment'
import { logger } from '/client/logging'


angular.module('visitry.browser').controller('adminManageCtrl', function ($scope, $state, $reactive, $cookies, $mdDialog, AdminVisitDetailsDialog, UserDetailsDialog, ChooseAgencyDialog) {
  $reactive(this).attach($scope);

  this.topVisitorsDayRange = 365;
  this.agencyId = $cookies.get('agencyId');
  this.isTopVisitorsReady = false;
  this.isFrequentVisitorsReady = false;
  this.isApplicantDataReady = false;
  this.isUserDataReady = false;
  this.freqVisitors = [];
  this.applicantCount;

  let visitsSubscription = this.subscribe('agencyVisits', ()=> {
    return [this.getReactively('agencyId')]
  }, ()=> {
    this.isVisitDataReady = true;
  });
  let userDataSubscription = this.subscribe('userdata', ()=>{
    return [this.getReactively('applicantCount')] //so we will republish when we get a new enrollment
  }, ()=> {
    this.isUserDataReady = true;
  });
  let applicantsSubscription = this.subscribe('applicants', ()=> {
    return [this.getReactively('agencyId')]
  }, ()=> {
    this.isApplicantDataReady = true;
  });

  this.autorun(()=> {
    this.isUserDataReady = userDataSubscription.ready();
    this.isVisitDataReady = visitsSubscription.ready();
    this.isApplicantDataReady = applicantsSubscription.ready();
  });


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
    applicantCount() {
      this.applicantCount = Counts.get('numberOfApplicants');
      return this.applicantCount;
    },
    applicants: ()=> {
      let isDataThere = this.isApplicantDataReady && this.getReactively('isUserDataReady');
      let enrollments = Enrollment.find({agencyId:this.getReactively('agencyId'), approvalDate: null });
      return enrollments.map( function(applicant) { return Meteor.myFunctions.getUser(applicant.userId)});
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
            if (visitor) {
              visitor.visitCount = visitFreq.numVisits;
            }
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