import { FacebookAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../miAppMovil/firebaseConfig';

export async function signInWithFacebook() {
  const appId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID?.trim();
  const clientToken = process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN?.trim();

  if (!appId || !clientToken) {
    throw new Error('FACEBOOK_NATIVE_CONFIG_MISSING');
  }

  let facebook: typeof import('react-native-fbsdk-next');
  try {
    facebook = await import('react-native-fbsdk-next');
  } catch {
    throw new Error('NATIVE_AUTH_REQUIRES_DEVELOPMENT_BUILD');
  }

  const result = await facebook.LoginManager.logInWithPermissions([
    'public_profile',
    'email',
  ]);
  if (result.isCancelled) return null;

  const accessToken = await facebook.AccessToken.getCurrentAccessToken();
  if (!accessToken) {
    throw new Error('FACEBOOK_ACCESS_TOKEN_MISSING');
  }

  const credential = FacebookAuthProvider.credential(accessToken.accessToken);
  return signInWithCredential(auth, credential);
}
