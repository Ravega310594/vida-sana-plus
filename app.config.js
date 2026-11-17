const fs = require('node:fs');
const path = require('node:path');

const config = require('./app.json').expo;
const googleAndroidFile = path.join(__dirname, 'google-services.json');
const googleIosFile = path.join(__dirname, 'GoogleService-Info.plist');
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
const facebookAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID?.trim();
const facebookClientToken = process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN?.trim();

const plugins = [...config.plugins];
const hasGoogleFirebaseFiles =
  fs.existsSync(googleAndroidFile) && fs.existsSync(googleIosFile);

if (hasGoogleFirebaseFiles) {
  config.android.googleServicesFile = './google-services.json';
  config.ios.googleServicesFile = './GoogleService-Info.plist';
  plugins.push('@react-native-google-signin/google-signin');
} else if (googleIosClientId) {
  const suffix = '.apps.googleusercontent.com';
  if (!googleIosClientId.endsWith(suffix)) {
    throw new Error('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID must be a Google OAuth client ID.');
  }

  plugins.push([
    '@react-native-google-signin/google-signin',
    {
      iosUrlScheme: `com.googleusercontent.apps.${googleIosClientId.slice(0, -suffix.length)}`,
    },
  ]);
}

if (facebookAppId && facebookClientToken) {
  plugins.push([
    'react-native-fbsdk-next',
    {
      appID: facebookAppId,
      clientToken: facebookClientToken,
      displayName: config.name,
      scheme: `fb${facebookAppId}`,
    },
  ]);
}

if (googleWebClientId && !googleWebClientId.endsWith('.apps.googleusercontent.com')) {
  throw new Error('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID must be a Google OAuth client ID.');
}

config.ios.bundleIdentifier = 'com.vidasana.plus';
config.android.package = 'com.vidasana.plus';
config.plugins = plugins;

module.exports = config;
