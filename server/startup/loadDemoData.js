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
  if(Visits.find().count() ===0){
    var visits = [
      {
        "visitorId": '1',
        "visitorImg":'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png',
        "date": new Date(2016,3,1),
        "notes": '1pm works best',
        "location": {
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "visitorId": '1',
        "visitorImg":'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png',
        "date": new Date(2016,3,15),
        "notes": '3pm works best',
        "location": {
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "visitorId": '1',
        "visitorImg": 'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png',
        "date": new Date(2016,3,16),
        "notes": '10pm works best',
        "location": {
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "requestorId": 4,
        "date": new Date(2016,1,29),
        "timeOfDay": "Morning",
        "notes": 'pick me, please',
        "location": {
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "requestorId": '2',
        "date": new Date(2016,3,15),
        "timeOfDay": "Afternoon",
        "notes": 'Shall we go for coffee?',
        "location": {
          "latitude": 42,
          "longitude": -71
        }
      }
    ];
    for ( i = 0; i < visits.length; i++ ) {
      Visits.insert( visits[i]);
    }
  }

});