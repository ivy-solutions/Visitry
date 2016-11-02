/**
 * Created by n0235626 on 8/9/16.
 */
import { Visit } from '/model/visits'
import {TopVisitors} from '/model/users'


angular.module('visitry.browser').controller('adminManageCtrl', function ($scope, $state, $reactive, $cookies) {
  $reactive(this).attach($scope);

  this.topVisitorsDayRange = 365;
  this.agencyId = $cookies.get('agencyId');
  this.isTopVisitorsReady = false;
  this.isFrequentVisitorsReady = false;
  this.isUserDataReady = false;
  this.isVisitDataReady = false;
  this.freqVisitors=[];
  this.subscribe('visits', ()=> {
    return [];
  }, ()=> {
    this.isVisitDataReady = true;
  });
  this.subscribe('userdata', ()=> {
    return [];
  }, ()=> {
    this.isUserDataReady = true;
  });
  this.subscribe('topVisitors', ()=> {
      return [this.getReactively('agencyId'), this.getReactively('topVisitorsDayRange')]
    }, ()=> {
      this.isTopVisitorsReady = true;
    }
  );

  this.helpers({
    upcomingVisits: ()=> {
      let selector = {
        'visitTime': {$exists: true, $gt: new Date()},
        'agencyId': {$eq: this.agencyId}
      };
      var visits = Visit.find(selector, {
        sort: {visitTime: 1}, limit: 10
      });
      return Meteor.myFunctions.groupVisitsByRequestedDate(visits);
    },
    outstandingRequests: ()=> {
      let selector = {
        'visitTime': {$eq: null},
        'agencyId': {$eq: this.agencyId}
      };
      var visits = Visit.find(selector, {sort: {requestedDate: 1}, limit: 10});
      return Meteor.myFunctions.groupVisitsByRequestedDate(visits);
    },
    topVisitors: ()=> {
      return TopVisitors.find({}, {sort: {visitCount: -1}, limit: 10});
    },
    frequentVisitors: () => {
      var visitorIds = [];
      var users;
      this.call('visitorsByFrequency', this.getReactively('agencyId'), this.getReactively('topVisitorsDayRange'), (error, visitorFrequency) => {
        if (error)
          console.log( error );
        else {
           this.freqVisitors = visitorFrequency.map( function (visitFreq) {
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
});