/**
 * Created by Daniel Biales on 1/22/17.
 */
angular.module('visitry').factory('appFeedbackTrelloService', function ($http) {
  var trelloService = {};
  trelloService.addNewQACard = (title, desc, type)=> {
    return $http.post('https://api.trello.com/1/cards', {
      idList: "5885424ab2b08d18d2363edf",
      pos: "top",
      name: title,
      desc: type + ': ' + desc
    }, {
      params: {
        key: '22a7c1391a746ca09cc0b4e110cf968d',
        token: '9bb72411dd4e32eca53b4c6f69bc2c43c149335809b48616a8d36703402b8e5d'
      }
    });
  };
  return trelloService;
});