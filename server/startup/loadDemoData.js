/**
 * Created by sarahcoletti on 2/17/16.
 */
Meteor.startup(function ()  {
  Visits._ensureIndex({ "location.geo.coordinates": '2dsphere'});

  if (Meteor.users.find().count() === 0) {
    //create one admin user
    Accounts.createUser({
      username: 'Sarahc', email: 'sarahcoletti12@gmail.com', password: 'Visitry99',
      userData: {firstName: 'Sarah', lastName: 'Coletti', role: "visitor"}
    });

    //create the agencies
    if (Agencies.find().count() === 0) {
      var sarahc = Meteor.users.findOne({username: 'Sarahc'});
      var agencies = [
        {
          name: "IVY Agency",
          description: "IVY Agency provides friendly visitor services to local area.",
          website: "http://visitry.org",
          location: {
            address: "80 Willow Street, Acton, MA 01720",
            geo: {
              "type": "Point",
              "coordinates": [-71.477358, 42.468846]
            }
          },
          activeUntil: new Date(2020, 11, 31, 0, 0, 0, 0),
          administratorId: sarahc._id,
          contactEmail: 'sarahcoletti12@gmail.com',
          contactPhone: '978-264-4171',
          createdAt:new Date()
        },
        {
          name: "Test Pilot Senior Center",
          description: "For demo and test purposes",
          website: "http://ivy-solutions.org",
          location: {
            address: "Boston",
            geo: {
              "type": "Point",
              "coordinates": [-71.0589, 42.3601]
            }
          },
          activeUntil: new Date(2020, 11, 31, 0, 0, 0, 0),
          administratorId: sarahc._id,
          contactEmail: 'sarahcoletti12@gmail.com',
          contactPhone: '978-264-4171',
          createdAt:new Date()
        }
      ];
      for (var i = 0; i < agencies.length; i++) {
        Agencies.insert(agencies[i]);
      }
    }

    var agency = Agencies.findOne({name:'IVY Agency'});
    //create a few test users
    Accounts.createUser({
      username: 'Vivian', email: 'viv@aol.com', password: 'Visitry99',
      userData: {
        firstName: 'Vivian',
        lastName: 'Visitor',
        role: "visitor",
        agencyId: agency._id,
        interests: ['Studying clarinet', 'Reads fiction', 'New to area']
      }
    });
    Accounts.createUser({
      username: 'requester1', email: 'rq1@gmail.com', password: 'Visitry99',
      userData: {
        firstName: 'Raoul',
        lastName: 'Robbins',
        role: "requester",
        agencyId: agency._id,
        interests: ['WWII and Korean War veteran', 'Red Sox fan', 'grows orchids']
      }
    });
    Accounts.createUser({
      username: 'requester2', email: 'rq2@gmail.com', password: 'Visitry99', role: "requester",
      userData: {
        firstName: 'Rita',
        lastName: 'Smith',
        role: "requester",
        interests: ['Hiking', '6 grandchildren'],
        agencyId: agency._id
      }
    });
    Accounts.createUser({
      username: 'requester3', email: 'rq3@gmail.com', password: 'Visitry99',
      userData: {
        firstName: 'Ron',
        lastName: 'Wang',
        role: "requester",
        agencyId: agency._id,
        interests: ['Has 4 cats', 'Sings in church choir']
      }
    });
  }

  if(Visits.find().count() ===0){
    var agency = Agencies.findOne({name:'IVY Agency'});
    var sarahc = Meteor.users.findOne({username:'Sarahc'});
    var vivian = Meteor.users.findOne({username:'Vivian'});
    var requester1 = Meteor.users.findOne({username:'requester1'});
    var requester2 = Meteor.users.findOne({username:'requester2'});
    var requester3 = Meteor.users.findOne({username:'requester3'});

    var futureMonth = 6;
    var pastMonth = 4;
    var visits = [
      {
        "requesterId":requester1._id,
        "agencyId": agency._id,
        "createdAt":new Date(),
        "visitorId": sarahc._id,
        "requestedDate": new Date(2016,futureMonth,1,13,0,0,0),
        "notes": '1pm works best',
        "location": {
          "name":"36 Charter Rd, Acton, MA 01720",
          "geo": { "type": "Point",
            "coordinates": [-71.458239, 42.479591]
          }
        }
      },
      {
        "requesterId":requester1._id,
        "agencyId": agency._id,
        "visitorId": vivian._id,
        "createdAt":new Date(),
        "requestedDate": new Date(2016,futureMonth,15,16,0,0,0),
        "notes": '3pm works best',
        "location": {
          "name":"Walden Pnd",
          "geo": { "type": "Point",
            "coordinates": [-71.338848, 42.437465]
          }
        }
      },
      {
        "requesterId": requester1._id,
        "agencyId": agency._id,
        "visitorId": vivian._id,
        "createdAt":new Date(),
        "requestedDate": new Date(2016,pastMonth,21,9,0,0,0),
        "visitTime": new Date(2016, pastMonth, 21, 13, 30, 0, 0),
        "notes": '10pm works best',
        "location": {
          "name":"Boston",
          "geo": { "type": "Point",
            "coordinates": [-71.0589, 42.3601]
          }
        }
      },
      {
        "requesterId": requester2._id,
        "agencyId": agency._id,
        "createdAt":new Date(),
        "requestedDate": new Date(2016,futureMonth,29,9,0,0,0),
        "notes": 'pick me, please',
        "location": {
          "name":"Belmont, MA",
          "geo": { "type": "Point",
            "coordinates": [-71.176972, 42.396341]
          }
        }
      },
      {
        "requesterId": requester1._id,
        "agencyId": agency._id,
        "createdAt":new Date(),
        "requestedDate": new Date(2016,futureMonth,15,13,0,0,0),
        "notes": 'Shall we go for coffee?',
        "location": {
          "name":"Boston Public Garden",
          "geo": { "type": "Point",
            "coordinates": [-71.069459, 42.35621]
          }
        }
      },
      {
        "requesterId":requester1._id,
        "agencyId": agency._id,
        "visitorId": sarahc._id,
        "createdAt":new Date(),
        "requestedDate": new Date(2016,pastMonth,1,13,0,0,0),
        "notes": 'This already happened',
        "location": {
          "name":"Boston",
          "geo": { "type": "Point",
            "coordinates": [-71.0589, 42.3601]
          }
        }
      },
      {
        "requesterId": requester2._id,
        "agencyId": agency._id,
        "createdAt":new Date(),
        "requestedDate": new Date(2016,futureMonth,17,9,0,0,0),
        "notes": 'I need to walk Bowser.',
        "location": {
          "name":"Riverside, Cambridge, MA",
          "geo": { "type": "Point",
            "coordinates": [-71.111397, 42.368699]
          }
        }
      }
    ];
    for ( i = 0; i < visits.length; i++ ) {
      var visit = visits[i];
      check(visit,Visits.schema);
      Visits.insert( visit);
    }
  }



});