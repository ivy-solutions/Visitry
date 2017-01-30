
Meteor.methods({
  updatePicture(userId,data) {
    if (!this.userId) {
      console.log("updatePicture - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update picture.');
    }
    var currentUser = User.findOne({_id: userId}, {fields: {userData:1}});
    currentUser.userData.picture = data;
    currentUser.save({fields: ['userData.picture']}, function (err, id) {
      if (err) {
        console.log("updatePicture failed to update user. err: " + err);
        throw err;
      }
    });
    console.log("updatePicture for userId: " + this.userId);
  },
  getUserData(userId) {
    console.log("getUserData " + userId);
    var user = User.find({_id: userId}, {fields: {userData:1}});
    return user.userData;
  },
  getRoles() {
    console.log("getRoles " + this.userId);
    var user = Meteor.users.find({_id: Meteor.userId()}, {fields: {roles:1}});
    return user.roles;
  }
});
