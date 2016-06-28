Package.describe({
  name: 'visitry-browser',
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
  api.use('less');

  api.addFiles([
    'client/lib/module.js',
    'client/auth/login/login.component.js',
    'client/auth/login/login.html',
    'client/auth/register/register.component.js',
    'client/auth/register/register.html',
    'client/auth/reset-password/reset-password.component.js',
    'client/auth/reset-password/reset-password.html',
    'client/users/profile.html',
    'client/visitry/visitry.html',
    'client/visits/browse-visit-requests/browse-visit-requests.html',
    'client/visits/visitor-view-upcoming/visitor-view-upcoming.html',
    'client/visits/schedule-visit/schedule-visit-modal.html',
    'client/styles/main.less'
  ], 'client')
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
});
