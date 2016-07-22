Package.describe({
  name: 'visitrymobile',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('angular');
  api.use('driftyco:ionic');
  api.use('less');
  api.use('mquandalle:bower');
  api.use('modules');

  api.addFiles([
    'client/lib/module.js',
    'client/agencies/list/agency-list.html',
    'client/auth/login/login.component.js',
    'client/auth/login/login.html',
    'client/auth/register/register.component.js',
    'client/auth/register/register.html',
    'client/users/profile.html',
    'client/visitry/visitry.html',
    'client/visits/browse-visit-requests/browse-visit-requests.html',
    'client/visits/pending-visits/pending-visits.html',
    'client/visits/request-visit/request-visit-modal.html',
    'client/visits/schedule-visit/schedule-visit-modal.html',
    'client/visits/visitor-view-upcoming/visitor-view-upcoming.html',
    'client/visits/visit-details/visit-details.html',
    'client/users/profile.less',
    'client/styles/login.less',
    'client/styles/main.less',
    'client/feedback/feedback.import.less',
    'client/visits/visit-details/visit-details.import.less',
    'client/visits/request-visit/google-places-autocomplete.import.less',
    'client/visits/schedule-visit/schedule-visit.import.less',
    'client/visits/browse-visit-requests/browse-visit-requests.import.less',
    'client/visits/request-visit/request-visit.import.less',
    'client/feedback/requesterFeedback.html'
  ], 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
});
