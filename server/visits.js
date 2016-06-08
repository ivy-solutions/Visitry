Meteor.publish("visits", function () {
    return Visits.find();
});
