import { Platform } from 'react-native';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../miAppMovil/firebaseConfig';

export async function signInWithGoogle() {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();

  if (!webClientId) {
    throw new Error('GOOGLE_WEB_CLIENT_ID_MISSING');
  }

  let googleSignIn: typeof import('@react-native-google-signin/google-signin');
  try {
    googleSignIn = await import('@react-native-google-signin/google-signin');
  } catch {
    throw new Error('NATIVE_AUTH_REQUIRES_DEVELOPMENT_BUILD');
  }

  googleSignIn.GoogleSignin.configure({
    webClientId,
    ...(iosClientId ? { iosClientId } : {}),
  });

  if (Platform.OS === 'android') {
    await googleSignIn.GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
  }

  const result = await googleSignIn.GoogleSignin.signIn();
  if (googleSignIn.isCancelledResponse(result)) return null;

  const { idToken } = result.data;
  if (!idToken) {
    throw new Error('GOOGLE_ID_TOKEN_MISSING');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}
