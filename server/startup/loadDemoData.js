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
        "requestedDate": new Date(2016,3,1,13,0,0,0),
        "notes": '1pm works best',
        "location": {
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "visitorId": '1',
        "visitorImg":'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png',
        "requestedDate": new Date(2016,3,15,16,0,0,0),
        "notes": '3pm works best',
        "location": {
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "requestorUsername": 'Requestor1',
        "visitorId": '1',
        "visitorImg": 'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png',
        "requestedDate": new Date(2016,3,21,9,0,0,0),
        "visitTime": new Date(2016, 3, 21, 13, 30, 0, 0),
        "notes": '10pm works best',
        "location": {
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "requestorUsername": 'Requestor2',
        "requestedDate": new Date(2016,1,29,9,0,0,0),
        "notes": 'pick me, please',
        "location": {
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "requestorUsername": 'Requestor3',
        "requestedDate": new Date(2016,3,15,13,0,0,0),
        "notes": 'Shall we go for coffee?',
        "location": {
          "latitude": 42,
          "longitude": -71
        }
      },
      {
        "requestorUsername": 'Requestor2',
        "requestedDate": new Date(2016,3,17,9,0,0,0),
        "notes": 'I need to walk Bowser.',
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
      username: 'Sarahc', email: 'sarahcoletti12@gmail.com', password: 'Visitry99',
      profile: {firstName: 'Sarah', lastName: 'Coletti'}
    });
    Accounts.createUser({
      username: 'Vivian', email: 'viv@aol.com', password: 'Visitry99',
      profile: {firstName: 'Vivian', lastName: 'Visitor'}
    });
    Accounts.createUser({
      username: 'Requestor1', email: 'rq1@gmail.com', password: 'Visitry99',
      profile: {firstName: 'Raoul', lastName: 'Robbins', interests:['WWII and Korean War veteran', 'Red Sox fan', 'grows orchids']}
    });
    Accounts.createUser({
      username: 'Requestor2', email: 'rq2@gmail.com', password: 'Visitry99',
      profile: {firstName: 'Rita', lastName: 'Smith', interests:['Hiking', 'Grandchildren']}
    });
    Accounts.createUser({
      username: 'Requestor3', email: 'rq3@gmail.com', password: 'Visitry99',
      profile: {firstName: 'Ron', lastName: 'Wang', interests:['Has 4 cats', 'Sings in church choir']}
    });
  }

});