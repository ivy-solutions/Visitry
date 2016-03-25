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
      username: 'requester1', email: 'rq1@gmail.com', password: 'Visitry99',
      profile: {firstName: 'Raoul', lastName: 'Robbins', interests:['WWII and Korean War veteran', 'Red Sox fan', 'grows orchids']}
    });
    Accounts.createUser({
      username: 'requester2', email: 'rq2@gmail.com', password: 'Visitry99',
      profile: {firstName: 'Rita', lastName: 'Smith', interests:['Hiking', 'Grandchildren']}
    });
    Accounts.createUser({
      username: 'requester3', email: 'rq3@gmail.com', password: 'Visitry99',
      profile: {firstName: 'Ron', lastName: 'Wang', interests:['Has 4 cats', 'Sings in church choir']}
    });
  }

  if(Visits.find().count() ===0){
    var sarahc = Meteor.users.findOne({username:'Sarahc'});
    var vivian = Meteor.users.findOne({username:'Vivian'});
    var requester1 = Meteor.users.findOne({username:'requester1'});
    var requester2 = Meteor.users.findOne({username:'requester2'});
    var requester3 = Meteor.users.findOne({username:'requester3'})

    var visits = [
      {
        "requesterId":requester1._id,
        "visitorId": sarahc._id,
        "visitorImg":'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png',
        "requestedDate": new Date(2016,3,1,13,0,0,0),
        "notes": '1pm works best',
        "location": {
          "name":"Boston",
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "requesterId":requester1._id,
        "visitorId": vivian._id,
        "visitorImg":'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png',
        "requestedDate": new Date(2016,3,15,16,0,0,0),
        "notes": '3pm works best',
        "location": {
          "name":"Boston",
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "requesterId": requester1._id,
        "visitorId": vivian._id,
        "visitorImg": 'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png',
        "requestedDate": new Date(2016,3,21,9,0,0,0),
        "visitTime": new Date(2016, 3, 21, 13, 30, 0, 0),
        "notes": '10pm works best',
        "location": {
          "name":"Boston",
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "requesterId": requester2._id,
        "requestedDate": new Date(2016,1,29,9,0,0,0),
        "notes": 'pick me, please',
        "location": {
          "name":"Boston",
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "requesterId": requester1._id,
        "requestedDate": new Date(2016,3,15,13,0,0,0),
        "notes": 'Shall we go for coffee?',
        "location": {
          "name":"Boston",
          "latitude": 42,
          "longitude": -71
        }
      },
      {
        "requesterId": requester2._id,
        "requestedDate": new Date(2016,3,17,9,0,0,0),
        "notes": 'I need to walk Bowser.',
        "location": {
          "name":"Boston",
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