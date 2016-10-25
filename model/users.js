import { Class } from 'meteor/jagi:astronomy';
import { Address } from '/model/address';

//required user information should be kept to bare minimum to streamline registration process
const UserData = Class.create({
  name: 'userData',
  fields: {
    firstName: {type: String, optional: true},
    lastName: {type: String, optional: true},
    agencyIds: {type: [String], optional: true},  //user can initially be unassigned to an agency
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
    }
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
    //roles: {type: [String]},  //Roles pacakge and astronomy validation don't work well together
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
    }
  }
});
var TopVisitors = new Mongo.Collection('topVisitors');

export {TopVisitors}
