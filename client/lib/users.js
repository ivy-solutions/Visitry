/**
 * Created by sarahcoletti on 3/18/16.
 */
// deny all client-side updates to users per Official Guide
Meteor.users.deny({
  update() { return true; }
});
