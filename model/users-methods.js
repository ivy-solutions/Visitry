Meteor.methods({
  updatePicture(data) {
    if (!this.userId) {
      console.log("updatePicture - user not logged in");
      throw new Meteor.Error('not-logged-in',
        'Must be logged in to update picture.');
    }
    var currentUser = User.findOne({_id: this.userId}, {fields: {userData:1}});
    currentUser.userData.picture = data;
    currentUser.save({fields: ['userData.picture']}, function (err, id) {
      if (err) {
        console.log("updatePicture failed to update user. err: " + err);
        throw err;
      }
    });
    console.log("updatePicture for userId: " + this.userId);
  }
});
