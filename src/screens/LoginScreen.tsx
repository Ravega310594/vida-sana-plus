import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../miAppMovil/firebaseConfig';
import SocialAuthOptions from '../components/SocialAuthOptions';
import { RootStackParamList } from '../types/navigation';
import { getLoginErrorMessage } from '../utils/auth';
import { notify } from '../utils/notify';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
const REMEMBERED_EMAIL_KEY = 'vidasana.rememberedEmail';

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberAccount, setRememberAccount] = useState(false);
  const [isRememberingLoading, setIsRememberingLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadRememberedEmail = async () => {
      try {
        const rememberedEmail = await AsyncStorage.getItem(REMEMBERED_EMAIL_KEY);
        if (isMounted && rememberedEmail) {
          setEmail(rememberedEmail);
          setRememberAccount(true);
        }
      } catch (error) {
        console.error('No se pudo recuperar el correo guardado.', error);
        if (isMounted) {
          notify('No se pudo recuperar la cuenta', 'Puedes ingresar tu correo manualmente.');
        }
      } finally {
        if (isMounted) setIsRememberingLoading(false);
      }
    };

    void loadRememberedEmail();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRememberToggle = async () => {
    if (isRememberingLoading) return;
    if (!rememberAccount) {
      setRememberAccount(true);
      return;
    }

    try {
      await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
      setRememberAccount(false);
    } catch (error) {
      console.error('No se pudo borrar el correo guardado.', error);
      notify('No se pudo actualizar la opción', 'Intenta nuevamente.');
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      notify('Falta información', 'Ingresa tu correo y contraseña para continuar.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      notify('No se pudo iniciar sesión', getLoginErrorMessage(error));
      return;
    }

    try {
      if (rememberAccount) {
        await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
      } else {
        await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
    } catch (error) {
      console.error('No se pudo guardar la preferencia de cuenta.', error);
      notify(
        'Sesión iniciada',
        'No se pudo guardar el correo para el próximo inicio de sesión.',
      );
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      notify('Ingresa tu correo', 'Escribe tu correo para recuperar la contraseña.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      notify('Correo enviado', 'Revisa tu bandeja de entrada para restablecer tu contraseña.');
    } catch (error) {
      notify(
        'No se pudo enviar el correo',
        error instanceof Error ? error.message : 'Intenta nuevamente.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require('../../assets/logo-up.png')}
            style={styles.logo}
            accessibilityLabel="VidaSana+, tu salud en tus manos"
          />
          <Text style={styles.title}>Inicia sesión</Text>
          <Text style={styles.subtitle}>
            Accede a tu cuenta y sigue disfrutando de una vida saludable.
          </Text>

          <TextInput
            accessibilityLabel="Correo electrónico"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Correo electrónico"
            placeholderTextColor="#8492a6"
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            returnKeyType="next"
          />
          <TextInput
            accessibilityLabel="Contraseña"
            placeholder="Contraseña"
            placeholderTextColor="#8492a6"
            secureTextEntry
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            onSubmitEditing={handleLogin}
            returnKeyType="done"
          />
          <View style={styles.optionsRow}>
            <TouchableOpacity
              accessibilityRole="checkbox"
              accessibilityLabel="Recordar mi cuenta"
              accessibilityState={{ checked: rememberAccount, disabled: isRememberingLoading }}
              disabled={isRememberingLoading}
              onPress={handleRememberToggle}
              style={styles.rememberButton}
            >
              <View
                style={[
                  styles.checkbox,
                  rememberAccount && styles.checkboxSelected,
                ]}
              >
                {rememberAccount ? <Text style={styles.checkboxCheck}>✓</Text> : null}
              </View>
              <Text style={styles.rememberText}>Recordar mi cuenta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePasswordReset}
            >
              <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>＋  Regístrate gratis</Text>
          </TouchableOpacity>
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>o</Text>
            <View style={styles.separatorLine} />
          </View>
          <SocialAuthOptions />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5fbf4' },
  keyboard: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
  },
  logo: { width: '100%', height: 145, resizeMode: 'contain', marginBottom: 2 },
  title: { color: '#102d59', fontSize: 30, fontWeight: '800', textAlign: 'center' },
  subtitle: {
    color: '#5d6672',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginHorizontal: 8,
    marginTop: 7,
    marginBottom: 20,
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: '#d8e0e9',
    borderRadius: 28,
    paddingHorizontal: 18,
    marginBottom: 11,
    backgroundColor: '#fff',
    color: '#17335e',
    fontSize: 14,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  rememberButton: { flexDirection: 'row', alignItems: 'center', minHeight: 36, gap: 7 },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#8492a6',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: '#079343', borderColor: '#079343' },
  checkboxCheck: { color: '#fff', fontSize: 12, fontWeight: '800', lineHeight: 15 },
  rememberText: { color: '#42516a', fontSize: 12, fontWeight: '600' },
  linkText: { color: '#087b42', fontWeight: '700', fontSize: 12, textDecorationLine: 'underline' },
  primaryButton: {
    minHeight: 54,
    borderRadius: 30,
    backgroundColor: '#079343',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 9,
  },
  primaryButtonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  separator: { flexDirection: 'row', alignItems: 'center', marginVertical: 17 },
  separatorLine: { height: 1, flex: 1, backgroundColor: '#d6dce4' },
  separatorText: { color: '#102d59', fontWeight: '800', marginHorizontal: 13 },
  registerButton: {
    minHeight: 52,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#078447',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  registerButtonText: { color: '#087b42', fontSize: 17, fontWeight: '800' },
});
