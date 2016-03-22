/**
 * Created by n0235626 on 3/9/16.
 */
Meteor.startup(function() {
  GoogleMaps.load({
    key: 'AIzaSyD154K8h5vAnX948prd0X-zI2eIgJuCOfI',
    libraries: 'places'  // also accepts an array if you need more than one
  });

/*  GoogleMaps.init({
    'sensor': false, //optional
    'key': 'AIzaSyD154K8h5vAnX948prd0X-zI2eIgJuCOfI', //optional
    'language': 'en',  //optional
    'libraries': 'places'
  });
  GoogleMaps.load();*/
});