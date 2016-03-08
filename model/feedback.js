Feedback = new Mongo.Collection("feedback");

!//TODO check role
  Feedback.allow({
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
