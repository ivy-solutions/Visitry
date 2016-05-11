/**
 * Created by n0235626 on 3/9/16.
 */
// This section sets up some basic app metadata,
// the entire section is optional.
App.info({
  id: 'com.ivy-solutions.visitry',
  name: 'Visitry',
  description: 'visitry',
  author: 'Ivy-Solutions',
  email: 'contact@example.com',
  website: 'http://visitry.org'
});

App.accessRule('*.google.com/*');
App.accessRule('*.googleapis.com/*');
App.accessRule('*.gstatic.com/*');