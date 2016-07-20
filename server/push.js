/**
 * Created by sarahcoletti on 7/18/16.
 */
Push.debug=false;

Push.allow({
  send: function(userId, notification) {
    return true; // Allow all users to send
  }
});

Meteor.methods({
  serverNotification: function(text,title) {
    var badge = 1
    Push.send({
      from: 'push',
      title: title,
      text: text,
      badge: badge,
      payload: {
        title: title,
        text:text
      },
      query: {
        // this will send to all users
      }
    });
  },
  userNotification: function(text,title,userId) {
    var badge = 1
    Push.send({
      from: 'push',
      title: title,
      text: text,
      badge: badge,
      payload: {
        title: title,
        text:text
      },
      query: {
        userId: userId //this will send to a specific Meteor.user()._id
      }
    });
  }
});
