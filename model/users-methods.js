
Meteor.methods({
  updatePicture(userId,data) {
    if (!this.userId) {
      console.log("updatePicture - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update picture.');
    }
    var currentUser = User.findOne({_id: userId}, {fields: {userData:1}});
    if (currentUser && currentUser.userData) {
      currentUser.userData.picture = data;
      currentUser.save({fields: ['userData.picture']}, function (err, id) {
        if (err) {
          console.log("updatePicture failed to update user. err: " + err);
          throw err;
        }
        console.log("updatePicture for userId: " + userId);
      });
    } else {
      console.log("no picture " + currentUser)
    }
  }
});
