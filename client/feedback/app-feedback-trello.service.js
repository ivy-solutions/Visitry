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
        token: 'cb7d8bbd76c6448ee22561ed14ac93d9272c5129f13358871639b983af8d96fd'
      }
    });
  };
  return trelloService;
});