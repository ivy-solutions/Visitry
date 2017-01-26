/**
 * Created by Daniel Biales on 1/25/17.
 */
angular.module('visitry.browser').controller('adminHelpHowToCtrl', function ($scope, $state, $reactive) {
  $reactive(this).attach($scope);
  this.articleName = 'Getting Started';
  this.articlePath = 'getting-started';
  this.autorun(()=> {
    this.articleHtml = '/packages/visitry-browser/client/admin-console/help/help-how-to-' + this.getReactively('articlePath') + '.html';
  });


  this.switchArticle = (article)=> {
    switch (article) {
      case 'getting-started':
        this.articleName = 'Getting Started';
        this.articlePath = article;
        break;
      case 'requester':
        this.articleName = 'Requester';
        this.articlePath = 'requester';
        break;
      case 'visitor':
        this.articleName = 'Visitor';
        this.articlePath = 'visitor';
        break;
      case 'administrator':
        this.articleName = 'Administrator';
        this.articlePath = 'administrator';
        break;
      default:
        this.articleName = 'Getting Started';
        this.articlePath = article;
        break;
    }
  };
});