/**
 * Created by Daniel Biales on 2/17/17.
 */
import { Meteor } from 'meteor/meteor';
import {logger} from'/server/logging';
import { Roles } from 'meteor/alanning:roles'

let Errors = {
  checkUserLoggedIn(userId, functionName, msg){
    if (!userId) {
      logger.error(functionName + " - user not logged in");
      throw new Meteor.Error('not-logged-in', msg);
    }
  },
  checkUserIsAdministrator(userId, agencyId, functionName, msg){
    if (!Roles.userIsInRole(userId, ['administrator'], agencyId)) {
      logger.error(functionName + ' - unauthorized');
      throw new Meteor.Error('unauthorized', msg);
    }
  }
};
export{Errors}