/**
 * Created by sarahcoletti on 2/17/16.
 */
Meteor.startup(function ()  {
  if (Agencies.find().count() === 0 ) {
    var agencies = [
      {
        name: "IVY Agency",
        description: "IVY Agency provides friendly visitor services to local area."
      }
    ];

    for ( var i = 1; i < agencies.length; i++ ) {
      Agencies.insert( agencies[i]);
    }
  }
  if (Visits.find().count() === 0 ){
    var visits = [
      {
        'owner':'Adam',
        'description': 'Social Visit',
        'location' : {
          'latitude' : 42.3601,
          'longitude' : -71.0589
        }
      }
    ];
    for ( i = 0 ; i < visits.length; i++ ) {
      Visits.insert(visits[i]);
    }
  }

});