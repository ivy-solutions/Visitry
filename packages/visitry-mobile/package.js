Package.describe({
  name: 'visitry-mobile',
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

  api.addFiles([
    'client/lib/module.js',
    'client/auth/login/login.component.js',
    'client/auth/login/login.html',
    'client/users/profile.html',
    'client/visitry/visitry.html',
    'client/visits/pending-visits/pending-visits.html',
    'client/visits/request-visit/request-visit-modal.html',
    'client/visits/list-requests/list-requests.html',
    'client/visits/pending-visits/cancel-visit-popup.html',
    'client/styles/login.less',
    'client/styles/main.less'
  ], 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
});
