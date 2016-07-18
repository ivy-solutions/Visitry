import { Class } from 'meteor/jagi:astronomy';
import { Address } from '/model/address';

//required user information should be kept to bare minimum to streamline registration process
const UserData = Class.create({
  name: 'userData',
  fields: {
    firstName: { type: String, optional: true },
    lastName: { type: String, optional: true},
    role: { type:String,
      validators: [
        { type: 'choice', param: ['visitor', 'requester'], message: 'role should be either "visitor" or "requester"'},
        { type: 'string', message: 'role should be either "visitor" or "requester"'}
      ]
    },
    agencyIds: {type: [String], optional: true },  //user can initially be unassigned to an agency
    interests: {type: [String], optional: true },
    location: {type: Address, optional:true},
    vicinity: {type: Number, optional:true, default: 10, validators: [{type:'gt', param: 0}]},
    picture: {type: String, optional: true}
  }
});

const User = Class.create({
  name: 'User',
  collection: Meteor.users,
  secured: true,
  fields: {
    username: {type: String },
    createdAt: { type: Date },
    userData: { type: UserData, optional:true }
  }
});

export { User };
