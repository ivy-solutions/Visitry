/**
 * Created by Daniel Biales on 1/22/17.
 */

import { logger } from '/client/logging'

angular.module('visitry').controller('appFeedbackCtrl', function ($scope, $state, $reactive) {
  $reactive(this).attach($scope);
  this.feedbackTypes = ['General', 'Bug', 'Improvement'];
  this.feedback = {title: '', type: '', comments: ''};
  let userBasicsSubscription = this.subscribe('userBasics', ()=>[], ()=> {
    setAgencyIds();
  });
  this.autorun(()=> {
    if (userBasicsSubscription.ready()) {
      setAgencyIds();
    }
  });

  this.submitFeedback = (form)=> {
    if (form.$valid) {
      let description = this.feedback.comments + '\nAgencies: [' + (this.feedback.agencyIds || '') + ']';
      Meteor.call('addNewQACard', this.feedback.title, description, this.feedback.type, (err)=> {
        if (err) {
          logger.error(err);
        }
      });
      $state.go('login');
    }
  };

  let setAgencyIds = ()=> {
    let user = User.findOne({_id: Meteor.userId()}, {fields: {'userData.agencyIds': 1}});
    if (user && user.userData && user.userData.agencyIds) {
      this.feedback.agencyIds = user.userData.agencyIds;
    }
  }
});