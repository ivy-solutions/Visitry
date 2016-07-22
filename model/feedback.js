RequesterFeedback = new Mongo.Collection("requesterFeedback");

!//TODO check role
  RequesterFeedback.allow({
    insert: function (userId, visit) {
      return true;
    },
    update: function (userId, visit, fields, modifier) {
      return true;
    },
    remove: function (userId, visit) {
      return true;
    }
  });
