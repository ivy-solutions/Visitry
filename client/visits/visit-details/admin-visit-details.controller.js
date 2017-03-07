/**
 * Created by n0235626 on 2/10/17.
 */
import { Visits } from '/model/visits'
import {logger} from '/client/logging'
import { Feedback,Feedbacks } from '/model/feedback'

angular.module('visitry').controller('adminVisitDetailsCtrl', function ($scope, $reactive, $cookies) {
  $reactive(this).attach($scope);
  this.visitId = this.locals.visitId;
  this.agencyId = $cookies.get('agencyId');
  this.subscribe('agencyVisits', ()=> {
    return [this.getReactively('agencyId')]
  });
  this.subscribe('feedback');
  this.today = new Date();

  this.visit = {};
  this.helpers({
    visit: ()=> {
      let visit = Visits.findOne({_id: this.getReactively('visitId')});
      this.visitStatus = (visit) ? getVisitStatus(visit) : '';
      Meteor.call('getUserPicture', visit.requesterId, (err, result)=> {
        if (err) {
          logger.error(err);
        } else {
          this.requesterPicture = result;
        }
      });
      if (visit.visitorId) {
        Meteor.call('getUserPicture', visit.visitorId, (err, result)=> {
          if (err) {
            logger.error(err);
          } else {
            this.visitorPicture = result;
          }
        });
      }
      return visit;
    },
    requester: ()=> User.findOne({_id: this.getReactively('visit.requesterId')}),
    requesterFeedback: ()=> {
      return Feedbacks.findOne({
        submitterId: this.getReactively('visit.requesterId'),
        visitId: this.getReactively('visitId')
      })
    },
    visitor: ()=> User.findOne({_id: this.getReactively('visit.visitorId')}),
    visitorFeedback: ()=> Feedbacks.findOne({
      submitterId: this.getReactively('visit.visitorId'),
      visitId: this.getReactively('visitId')
    })
  });
});

function getVisitStatus(visit) {
  let status = '';
  let today = new Date();
  switch (true) {
    case (visit.inactive):
      status = 'cancelled';
      break;
    case (!visit.visitorId && visit.requestedDate < today):
      status = 'unfilled';
      break;
    case (!visit.visitorId && visit.requestedDate > today):
      status = 'available';
      break;
    case (visit.visitTime && visit.visitTime > today):
      status = 'scheduled';
      break;
    case (visit.visitTime && visit.visitTime < today):
      status = 'complete';
      break;
    default:
      break;
  }
  return status;
}
