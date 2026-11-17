import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  type UserCredential,
} from 'firebase/auth';
import { auth } from '../../miAppMovil/firebaseConfig';
import { useStore } from '../context/StoreContext';
import SocialAuthOptions from '../components/SocialAuthOptions';
import { getFirebaseAuthErrorCode, isStrongPassword } from '../utils/auth';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const { setUser } = useStore();

  const handleRegister = async () => {
    if (isSubmitting) return;
    setAuthError('');
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Falta información', 'Completa todos los campos para crear tu cuenta.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setAuthError('Revisa el formato de tu correo electrónico.');
      return;
    }
    if (!isStrongPassword(password)) {
      setAuthError(
        'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.',
      );
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Confirma que ambas contraseñas sean iguales.');
      return;
    }

    setIsSubmitting(true);
    let credential: UserCredential;
    try {
      credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      const code = getFirebaseAuthErrorCode(error);
      const message =
        code === 'auth/password-does-not-meet-requirements' ||
        code === 'auth/weak-password'
          ? 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.'
          : code === 'auth/email-already-in-use'
            ? 'Ese correo ya está registrado.'
            : code === 'auth/invalid-email'
              ? 'Revisa el formato de tu correo electrónico.'
              : 'No se pudo crear la cuenta. Intenta de nuevo.';
      if (
        code !== 'auth/password-does-not-meet-requirements' &&
        code !== 'auth/weak-password' &&
        code !== 'auth/email-already-in-use' &&
        code !== 'auth/invalid-email'
      ) {
        console.error('Firebase no pudo crear la cuenta.', code ?? error);
      }
      setAuthError(message);
      setIsSubmitting(false);
      return;
    }

    try {
      await updateProfile(credential.user, { displayName: username.trim() });
      setUser({
        name: username.trim(),
        email: credential.user.email ?? email.trim(),
        phone: '',
        location: '',
        homeAddress: '',
        photoURL: '',
        photoPath: '',
      });
      Alert.alert('¡Cuenta creada!', 'Te damos la bienvenida a VidaSana+.');
    } catch (error) {
      console.error('La cuenta se creó, pero no se pudo guardar el usuario.', error);
      Alert.alert(
        'Cuenta creada',
        'No se pudo guardar el nombre de usuario. Puedes actualizarlo más tarde.',
      );
    } finally {
      setIsSubmitting(false);
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>‹  Volver</Text>
          </TouchableOpacity>
          <View style={styles.brandMark}>
            <Text style={styles.brandEmoji}>🌿</Text>
          </View>
          <Text style={styles.brand}>VidaSana<Text style={styles.plus}>+</Text></Text>
          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>
            Únete y descubre opciones deliciosas para cuidarte.
          </Text>
          <TextInput
            accessibilityLabel="Nombre de usuario"
            placeholder="Nombre de usuario"
            placeholderTextColor="#8492a6"
            value={username}
            onChangeText={(value) => {
              setUsername(value);
              setAuthError('');
            }}
            style={styles.input}
            autoCapitalize="none"
            returnKeyType="next"
          />
          <TextInput
            accessibilityLabel="Correo electrónico"
            placeholder="Correo electrónico"
            placeholderTextColor="#8492a6"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setAuthError('');
            }}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
          <TextInput
            accessibilityLabel="Contraseña"
            placeholder="Contraseña (mín. 8, mayúscula, minúscula y número)"
            placeholderTextColor="#8492a6"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setAuthError('');
            }}
            style={styles.input}
            secureTextEntry
            returnKeyType="next"
          />
          <TextInput
            accessibilityLabel="Confirmar contraseña"
            placeholder="Confirmar contraseña"
            placeholderTextColor="#8492a6"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              setAuthError('');
            }}
            style={styles.input}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />
          <View style={styles.termsRow}>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.terms}>
              Al registrarte aceptas nuestros términos y política de privacidad.
            </Text>
          </View>
          <TouchableOpacity
            accessibilityState={{ disabled: isSubmitting }}
            disabled={isSubmitting}
            style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
            onPress={handleRegister}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
            </Text>
          </TouchableOpacity>
          {authError ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {authError}
            </Text>
          ) : null}
          <SocialAuthOptions title="O regístrate con" />
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.prototypeNote}>
            <Text style={styles.prototypeText}>
              Tu cuenta se guarda de forma segura en Firebase.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5fbf4' },
  keyboard: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 30, justifyContent: 'center' },
  back: { alignSelf: 'flex-start', marginBottom: 20 },
  backText: { color: '#087b42', fontWeight: '700', fontSize: 15 },
  brandMark: { width: 64, height: 64, borderRadius: 21, alignSelf: 'center', backgroundColor: '#e5f6e8', alignItems: 'center', justifyContent: 'center' },
  brandEmoji: { fontSize: 35 },
  brand: { textAlign: 'center', color: '#075537', fontWeight: '800', fontSize: 24, marginTop: 8 },
  plus: { color: '#39b54a' },
  title: { textAlign: 'center', color: '#102d59', fontWeight: '800', fontSize: 27, marginTop: 18 },
  subtitle: { textAlign: 'center', color: '#657286', fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 22 },
  input: { minHeight: 53, borderWidth: 1, borderColor: '#d8e0e9', borderRadius: 14, paddingHorizontal: 15, marginBottom: 11, backgroundColor: '#fff', color: '#17335e', fontSize: 14 },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, marginBottom: 10 },
  check: { color: '#fff', backgroundColor: '#079343', width: 20, height: 20, borderRadius: 5, textAlign: 'center', overflow: 'hidden', lineHeight: 20, marginRight: 8 },
  terms: { color: '#657286', fontSize: 11, flex: 1, lineHeight: 16 },
  primaryButton: { minHeight: 53, borderRadius: 27, backgroundColor: '#079343', alignItems: 'center', justifyContent: 'center', marginTop: 9 },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  errorText: { color: '#b42318', fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 9 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' },
  loginText: { color: '#46556c', fontSize: 13 },
  loginLink: { color: '#087b42', fontWeight: '800', fontSize: 13, textDecorationLine: 'underline' },
  prototypeNote: { backgroundColor: '#e9f8ed', borderRadius: 10, padding: 10, marginTop: 22 },
  prototypeText: { color: '#087b42', fontSize: 10, textAlign: 'center' },
});
