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
        "requesterId":'1',
        "visitorId": '1',
        "visitorImg":'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png',
        "date": 1459958365000,
        "notes": '1pm works best',
        "location": {
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "requesterId":'1',
        "visitorId": '1',
        "visitorImg":'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png',
        "date": 1460995165000,
        "notes": '3pm works best',
        "location": {
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "requesterId": '1',
        "visitorId": '1',
        "visitorImg": 'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png',
        "date": 1461005965000,
        "notes": '10pm works best',
        "location": {
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "requesterId": 4,
        "date": '1484197200000',
        "timeOfDay": "Morning",
        "notes": 'pick me, please',
        "location": {
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "requesterId": '2',
        "date": '1456710108224',
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

  if (Meteor.users.find().count() === 0) {
    Accounts.createUser({
      username: 'sarahc2', email: 'sarahcoletti12@gmail.com', password: 'vpass9901', _id: 2,
      profile: {firstName: 'Sarah', lastName: 'Coletti'}
    });
    Accounts.createUser({
      username: 'requestor4', email: 'rq@gmail.com', password: 'vpass9901', _id: 4,
      profile: {firstName: 'Raoul', lastName: 'Robbins'}
    });
  }

});