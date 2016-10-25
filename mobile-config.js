/**
 * Created by n0235626 on 3/9/16.
 */
App.info({
  id: 'com.ivysolutions.visitry.app',
  name: 'Visitry',
  version: '1.0.5',
  description: 'Request and schedule visits through volunteer visiting programs',
  author: 'IvySolutions',
  email: 'admin@visitry.org',
  website: 'http://visitry.org'
});

App.icons({
  // iOS
  'iphone_2x': 'resources/icons/ios/Icon-60@2x.png',  //120x120
  'iphone_3x': 'resources/icons/ios/Icon-60@3x.png',  //180x180
  'ipad': 'resources/icons/ios/Icon-76.png',  //76x76
  'ipad_2x': 'resources/icons/ios/Icon-76@2x.png',  //152x152
  'ipad_pro': 'resources/icons/ios/Icon-167.png', //167x167
  'ios_settings': 'resources/icons/ios/Icon-Small.png', //29x29
  'ios_settings_2x': 'resources/icons/ios/Icon-Small@2x.png', //58x58
  'ios_settings_3x': 'resources/icons/ios/Icon-Small@3x.png', //87x87
  'ios_spotlight': 'resources/icons/ios/Icon-Spotlight-40.png', //40x40
  'ios_spotlight_2x': 'resources/icons/ios/Icon-Spotlight-40@2x.png', //80x80

  // Android
  'android_hdpi': 'resources/icons/android/drawable-hdpi/ic_launcher.png',  //72x72
  'android_mdpi': 'resources/icons/android/drawable-mdpi/ic_launcher.png',  //48x48
  'android_xhdpi': 'resources/icons/android/drawable-xhdpi/ic_launcher.png', //96x96
  'android_xxhdpi': 'resources/icons/android/drawable-xxhdpi/ic_launcher.png', //144x144
  'android_xxxhdpi': 'resources/icons/android/drawable-xxxhdpi/ic_launcher.png' //192x192
});
App.launchScreens({
  // iOS
  'iphone_2x': 'resources/splash/ios/Default@2x~iphone_640x960.png',  //640x960
  'iphone5': 'resources/splash/ios/Default-568h@2x~iphone_640x1136.png',  //640x1136
  'iphone6': 'resources/splash/ios/Default-750@2x~iphone6-portrait_750x1334.png', //750x1134
  'iphone6p_portrait': 'resources/splash/ios/Default-1242@3x~iphone6s-portrait_1242x2208.png',  //1242x2208
  'iphone6p_landscape': 'resources/splash/ios/Default-1242@3x~iphone6s-landscape_2208x1242.png',  //2208x1242

  'ipad_portrait': 'resources/splash/ios/Default-Portrait~ipad_768x1024.png', //768x1024
  'ipad_portrait_2x': 'resources/splash/ios/Default-Portrait@2x~ipad_1536x2048.png',  //1536x2048
  'ipad_landscape': 'resources/splash/ios/Default-Landscape~ipad_1024x768.png', //1024x768
  'ipad_landscape_2x': 'resources/splash/ios/Default-Landscape@2x~ipad_2048x1536.png',  //2048x1536

  // Android
  'android_mdpi_portrait': 'resources/splash/android/drawable-mdpi/screen.png', //320x470
  'android_mdpi_landscape': 'resources/splash/android/drawable-land-mdpi/screen.png', //470x320
  'android_hdpi_portrait': 'resources/splash/android/drawable-hdpi/screen.png', //480x640
  'android_hdpi_landscape': 'resources/splash/android/drawable-land-hdpi/screen.png', //640x480
  'android_xhdpi_portrait': 'resources/splash/android/drawable-xhdpi/screen.png', //720x960
  'android_xhdpi_landscape': 'resources/splash/android/drawable-land-xhdpi/screen.png',  //960x720
  'android_xxhdpi_portrait': 'resources/splash/android/drawable-xxhdpi/screen.png', //1080x1440
  'android_xxhdpi_landscape': 'resources/splash/android/drawable-land-xxhdpi/screen.png'  //1440x1080
});
App.accessRule("*");
App.accessRule('*.google.com/*');
App.accessRule('*.googleapis.com/*');
App.accessRule('*.gstatic.com/*');
App.accessRule('*.visitry.org', {
 'minimum-tls-version': 'TLSv1.0',
 'requires-forward-secrecy': false
});
App.accessRule('data:*', { type: 'navigation' });
App.accessRule('tel:*',{type:'intent'});

App.setPreference("WebAppStartupTimeout", 60000);
App.setPreference("LoadUrlTimeoutValue", 60000);
App.setPreference("BackupWebStorage", "local");

App.configurePlugin('phonegap-plugin-push', {
  SENDER_ID: '822210685703'
});