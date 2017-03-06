import { Class } from 'meteor/jagi:astronomy';
import { Address } from '/model/address';

//required user information should be kept to bare minimum to streamline registration process
const UserData = Class.create({
  name: 'userData',
  fields: {
    firstName: {type: String, optional: true},
    lastName: {type: String, optional: true},
    agencyIds: {type: [String], optional: true, index: 1},  //user can initially be unassigned to an agency
    prospectiveAgencyIds: {type: [String], optional: true},
    about: {type: String, optional: true},
    location: {type: Address, optional:true},
    locationInfo: { type: String, optional: true},
    visitRange: {type: Number, optional:true, default: 10, validators: [{type:'gt', param: 0}]},  //area in miles within which to filter visit requests
    picture: {type: String, optional: true},
    phoneNumber: { type: String, optional:true,
      validators: [
        {type: 'regexp', param: /^\(?[\d]{3}\)?[\s-]?[\d]{3}[\s-]?[\d]{4}$/, message: 'Phone number format should be (nnn) nnn-nnnn'},
        {type: 'minLength', param: 9},
        {type: 'maxLength', param: 15}
      ]
    },
    acceptSMS: {type: Boolean, default: true}
  }
});

User = Class.create({
  name: 'User',
  collection: Meteor.users,
  secured: true,
  fields: {
    username: {type: String, optional:true},
    createdAt: {type: Date},
    userData: {type: UserData, optional: true},
    emails: {
      type: [Object],
      default: function () {
        return [];
      }
    },
    fullName: {
      type: String,
      resolve(doc) {
        if (doc && doc.userData)
          return doc.userData.firstName + ' ' + doc.userData.lastName;
        else {
          return "no name"
        }
      }
    },
    roles: {type: Object, optional:true, index:1},
    hasAgency: {
      type: Boolean,
      resolve(doc) {
        if (doc && doc.userData && doc.userData.agencyIds && doc.userData.agencyIds.length > 0)
          return true;
        else
          return false;
      }
    }
  }
});
var TopVisitors = new Mongo.Collection('topVisitors');
var VisitorUsers = new Mongo.Collection('visitorUsers');
export {TopVisitors}
export {VisitorUsers}
