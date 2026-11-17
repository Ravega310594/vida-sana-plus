import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../../miAppMovil/firebaseConfig';
import { signInWithApple } from '../auth/signInWithApple';
import { signInWithFacebook } from '../auth/signInWithFacebook';
import { signInWithGoogle } from '../auth/signInWithGoogle';
import SocialRow, { type SocialProviderId } from './SocialRow';
import { getFirebaseAuthErrorCode } from '../utils/auth';

const PROVIDER_NAMES: Record<SocialProviderId, string> = {
  apple: 'Apple',
  google: 'Google',
  facebook: 'Facebook',
};

export default function SocialAuthOptions({ title = 'Continúa con' }: { title?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePress = async (id: SocialProviderId) => {
    const isNativeApple = Platform.OS === 'ios' && id === 'apple';
    if (Platform.OS !== 'web' && id === 'apple' && !isNativeApple) {
      Alert.alert(
        'Acceso no disponible en esta plataforma',
        'Apple Sign-In solo está disponible en iOS.',
      );
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (isNativeApple) {
        await signInWithApple();
      } else if (Platform.OS !== 'web' && id === 'google') {
        await signInWithGoogle();
      } else if (Platform.OS !== 'web' && id === 'facebook') {
        await signInWithFacebook();
      } else {
        let provider: GoogleAuthProvider | FacebookAuthProvider | OAuthProvider;
        if (id === 'google') {
          provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
        } else if (id === 'facebook') {
          provider = new FacebookAuthProvider();
          provider.addScope('email');
        } else {
          provider = new OAuthProvider('apple.com');
          provider.addScope('email');
          provider.addScope('name');
        }
        await signInWithPopup(auth, provider);
      }
    } catch (error) {
      const code = getFirebaseAuthErrorCode(error);
      const errorMessage = error instanceof Error ? error.message : undefined;
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'ERR_REQUEST_CANCELED' ||
        errorMessage === 'GOOGLE_SIGN_IN_CANCELLED'
      ) {
        return;
      }

      let message =
        'No se pudo iniciar sesión. Revisa la configuración del proveedor en Firebase e inténtalo de nuevo.';
      if (errorMessage === 'NATIVE_AUTH_REQUIRES_DEVELOPMENT_BUILD') {
        message =
          'Google y Facebook requieren instalar un development build; no funcionan dentro de Expo Go.';
      } else if (errorMessage === 'GOOGLE_WEB_CLIENT_ID_MISSING') {
        message =
          'Configura EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID en .env.local y vuelve a crear el development build.';
      } else if (errorMessage === 'GOOGLE_ID_TOKEN_MISSING') {
        message =
          'Google no devolvió un token de acceso. Revisa los IDs OAuth y vuelve a intentarlo.';
      } else if (errorMessage === 'FACEBOOK_NATIVE_CONFIG_MISSING') {
        message =
          'Configura el App ID y Client Token de Meta en .env.local y vuelve a crear el development build.';
      } else if (errorMessage === 'FACEBOOK_ACCESS_TOKEN_MISSING') {
        message =
          'Facebook no devolvió un token de acceso. Revisa la configuración de Meta e inténtalo de nuevo.';
      } else if (errorMessage === 'APPLE_AUTH_UNAVAILABLE') {
        message = 'Apple Sign-In no está disponible en este dispositivo.';
      } else if (errorMessage === 'APPLE_IDENTITY_TOKEN_MISSING') {
        message = 'Apple no devolvió un token de acceso. Inténtalo nuevamente.';
      } else if (code === 'auth/operation-not-allowed') {
        message = `Habilita ${PROVIDER_NAMES[id]} en los proveedores de acceso de Firebase.`;
      } else if (code === 'auth/unauthorized-domain') {
        message =
          'Agrega el dominio actual en Firebase Authentication > Dominios autorizados.';
      } else if (code === 'auth/account-exists-with-different-credential') {
        message =
          'Ese correo ya tiene otra forma de acceso. Inicia sesión con el proveedor original.';
      } else if (code === 'auth/popup-blocked') {
        message = 'Permite las ventanas emergentes para completar el acceso.';
      }

      const expectedSetupErrors = [
        'NATIVE_AUTH_REQUIRES_DEVELOPMENT_BUILD',
        'GOOGLE_WEB_CLIENT_ID_MISSING',
        'GOOGLE_ID_TOKEN_MISSING',
        'FACEBOOK_NATIVE_CONFIG_MISSING',
        'FACEBOOK_ACCESS_TOKEN_MISSING',
        'APPLE_AUTH_UNAVAILABLE',
        'APPLE_IDENTITY_TOKEN_MISSING',
      ];
      if (
        code !== 'auth/operation-not-allowed' &&
        code !== 'auth/unauthorized-domain' &&
        code !== 'auth/account-exists-with-different-credential' &&
        code !== 'auth/popup-blocked' &&
        !expectedSetupErrors.includes(errorMessage ?? '')
      ) {
        console.error('Falló el inicio de sesión social con Firebase.', code ?? error);
      }
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <SocialRow onPress={handlePress} disabled={isSubmitting} />
      {isSubmitting ? (
        <Text style={styles.note}>Conectando con Firebase…</Text>
      ) : (
        <Text style={styles.note}>
          {Platform.OS === 'web'
            ? 'La primera vez, Firebase crea tu cuenta automáticamente.'
            : Platform.OS === 'ios'
              ? 'Apple funciona en iOS. Google y Facebook requieren development build.'
              : 'Google y Facebook requieren development build. Apple solo funciona en iOS.'}
        </Text>
      )}
      {errorMessage ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#dce3eb',
    borderRadius: 17,
    padding: 12,
    backgroundColor: '#ffffffcc',
  },
  title: {
    color: '#102d59',
    fontWeight: '800',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 10,
  },
  note: { color: '#657286', fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 9 },
  error: { color: '#b42318', fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 8 },
});
