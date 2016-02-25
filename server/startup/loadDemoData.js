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
        "date": '1459958365000',
        "notes": '1pm works best',
        "location": {
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "visitorId": '1',
        "visitorImg":'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png',
        "date": '1460995165000',
        "notes": '3pm works best',
        "location": {
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "visitorId": '1',
        "visitorImg": 'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png',
        "date": '1461005965000',
        "notes": '10pm works best',
        "location": {
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      },
      {
        "date": '1461124800000',  //mar 20, 2016
        "notes": '9pm works best',
        "location": {
          "latitude": 42.3601,
          "longitude": -71.0589
        }
      }
    ];
    for ( var i = 0; i < visits.length; i++ ) {
      Visits.insert( visits[i]);
    }
  }

});