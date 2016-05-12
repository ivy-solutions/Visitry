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

App.icons({
  // iOS
  'iphone': 'resources/icons/ios/icon-60.png',
  'iphone_2x': 'resources/icons/ios/icon-60@2x.png',
  'iphone_3x': 'resources/icons/ios/icon-60@3x.png',
  'ipad': 'resources/icons/ios/icon-72.png',
  'ipad_2x': 'resources/icons/ios/icon-72@2x.png',

  // Android
  'android_hdpi': 'resources/icons/android/drawable-hdpi/ic_launcher.png',
  'android_mdpi': 'resources/icons/android/drawable-mdpi/ic_launcher.png',
  'android_xhdpi': 'resources/icons/android/drawable-xhdpi/ic_launcher.png',
});

App.accessRule('*.google.com/*');
App.accessRule('*.googleapis.com/*');
App.accessRule('*.gstatic.com/*');