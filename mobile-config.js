/**
 * Created by n0235626 on 3/9/16.
 */
// This section sets up some basic app metadata,
// the entire section is optional.
App.info({
  id: 'com.ivysolutions.Visitry',
  name: 'Visitry',
  description: 'visitry',
  author: 'IvySolutions',
  email: 'contact@example.com',
  website: 'http://visitry.org'
});

App.icons({
  // iOS
  'iphone_2x': 'resources/icons/ios/icon-60@2x.png',
  'iphone_3x': 'resources/icons/ios/icon-60@3x.png',
  'ipad': 'resources/icons/ios/icon-72.png',
  'ipad_2x': 'resources/icons/ios/icon-72@2x.png',

  // Android
  'android_hdpi': 'resources/icons/android/drawable-hdpi/ic_launcher.png',
  'android_mdpi': 'resources/icons/android/drawable-mdpi/ic_launcher.png',
  'android_xhdpi': 'resources/icons/android/drawable-xhdpi/ic_launcher.png'
});

App.accessRule("*");
App.accessRule('*.google.com/*');
App.accessRule('*.googleapis.com/*');
App.accessRule('*.gstatic.com/*');
App.accessRule('http://52.87.157.113:3000', {
  'minimum-tls-version': 'TLSv1.0',
  'requires-forward-secrecy': false,
});