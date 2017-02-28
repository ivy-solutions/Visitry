/**
 * Created by Daniel Biales on 1/29/17.
 */
import { Visit,Visits } from '/model/visits'
import { Feedback,Feedbacks } from '/model/feedback'
import {VisitorUsers} from '/model/users'
import { Roles } from 'meteor/alanning:roles'

angular.module('visitry').controller('userDetailsCtrl', function ($scope, $cookies, $reactive,AdminVisitDetailsDialog) {
  $reactive(this).attach($scope);
  this.userId = this.locals.userId;
  this.agencyId = $cookies.get('agencyId');

  this.isVisitor = Roles.userIsInRole(this.getReactively('userId'), ['visitor']);
  let userdataSubscription = this.subscribe('userdata', ()=>[], ()=> {
    this.isVisitor = Roles.userIsInRole(this.getReactively('userId'), ['visitor']);
    userdataSubscription.stop();
  });
  this.subscribe('feedback');
  this.subscribe('agencyVisits', ()=> {
    return [this.getReactively('agencyId')]
  });
  this.subscribe('visitorUsers', ()=> {
    return [this.getReactively('agencyId')]
  });

  this.visitsCount = 0;
  this.recordPerPage = 5;
  this.page = 1;
  this.today = new Date();

  this.completedVisitsCount = 0;
  this.pendingVisitsCount = 0;
  this.unfilledVisitsCount = 0;

  this.autorun(()=> {
    let lastMonth = new Date();
    lastMonth = lastMonth.setMonth(lastMonth.getMonth() - 1);
    this.completedVisitsCount = Visits.find({
      'visitTime': {$exists: true, $lt: this.today}, 'inactive': {$exists: false},
      $or: [{requesterId: this.userId}, {visitorId: this.userId}],
      'updatedAt': {$gt: new Date(lastMonth)}
    }).count();
    this.pendingVisitsCount = Visits.find({
      'requestedDate': {$gt: this.today}, 'inactive': {$exists: false},
      $or: [{requesterId: this.userId}, {visitorId: this.userId}],
      'updatedAt': {$gt: new Date(lastMonth)}
    }).count();
    this.unfilledVisitsCount = Visits.find({
      'requestedDate': {$lt: this.today, $gt: new Date(lastMonth)},
      visitTime: {$exists: false},
      'inactive': {$exists: false},
      $or: [{requesterId: this.userId}, {visitorId: this.userId}]
    }).count();
    this.hoursCount = 0;
    Feedbacks.find({
      'createdAt': {$gt: new Date(lastMonth)},
      'submitterId': this.userId
    }, {fields: {'timeSpent': 1}}).forEach((feedback)=> {
      this.hoursCount += (feedback.timeSpent / 60);
    });
  });


  this.helpers({
    user: () => {
      let queryOptions = {
        fields: {
          username: 1, emails: 1, fullName: 1, createdAt: 1, roles: 1,
          'userData.location': 1,
          'userData.firstName': 1, 'userData.lastName': 1,
          'userData.picture': 1, 'userData.about': 1, 'userData.phoneNumber': 1, 'visitorHours': 1, 'visitorRating': 1
        }
      };

      if (this.getReactively('isVisitor')) {
        return VisitorUsers.findOne({_id: this.getReactively('userId')}, queryOptions);
      } else {
        return User.findOne({_id: this.getReactively('userId')}, queryOptions);
      }
    },
    visits: ()=> {
      this.visitsCount = Visits.find({$or: [{requesterId: this.userId}, {visitorId: this.userId}]}).count();
      return Visits.find({$or: [{requesterId: this.userId}, {visitorId: this.userId}]}, {
        limit: parseInt(this.getReactively('recordPerPage')),
        skip: parseInt((this.getReactively('page') - 1) * this.recordPerPage),
        sort: {requestedDate: -1}
      })
    }
  });
  this.getUser = Meteor.myFunctions.getUser;
  this.getUserImage = Meteor.myFunctions.getUserImage;

  this.pageChanged = function (newPage) {
    this.page = newPage;
  };

  this.getUserVisitFeedback = (visitId)=> {
    return Feedbacks.findOne({visitId: visitId, submitterId: this.userId});
  };

  this.getVisitDetails = (visitId)=> {
    AdminVisitDetailsDialog.open(visitId);
  }
});