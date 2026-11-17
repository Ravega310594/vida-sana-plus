import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import {
  Timestamp,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from 'firebase/storage';
import { app, auth, db } from '../../miAppMovil/firebaseConfig';
import { useStore, type UserProfile } from '../context/StoreContext';
import { RootStackParamList } from '../types/navigation';
import { ScreenFrame, SectionTitle } from '../components/store/StoreComponents';
import { formatPrice } from '../data/catalog';
import { getFirebaseAuthErrorCode } from '../utils/auth';
import { styles } from '../styles/store';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

type SelectedPhoto = {
  uri: string;
  base64: string;
  mimeType: string;
};

type OrderSummary = {
  id: string;
  total: number;
  createdAt: string;
  createdAtMillis: number;
  status: string;
};

export default function ProfileScreen({ navigation }: Props) {
  const { user, setUser, cartCount } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<UserProfile>(user);
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedPhoto | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const loadOrders = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setOrders([]);
      return;
    }

    setIsLoadingOrders(true);
    setOrdersError('');
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid),
        ),
      );
      const loadedOrders = snapshot.docs.map((orderDocument) => {
        const data = orderDocument.data();
        const createdAt =
          data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
        return {
          id: orderDocument.id,
          total: typeof data.total === 'number' ? data.total : 0,
          createdAt:
            createdAt?.toLocaleDateString('es-PA') ?? 'Fecha pendiente',
          createdAtMillis: createdAt?.getTime() ?? 0,
          status:
            data.paymentStatus === 'not_processed'
              ? 'Pedido de prueba · pago no procesado'
              : 'Pedido recibido',
        };
      });
      setOrders(
        loadedOrders
          .sort((first, second) => second.createdAtMillis - first.createdAtMillis)
          .slice(0, 5),
      );
    } catch (error) {
      console.error('No se pudieron cargar los pedidos de Firestore.', error);
      setOrdersError(
        'No se pudieron cargar tus pedidos. Revisa las reglas de Firestore.',
      );
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadOrders();
    }, [loadOrders]),
  );

  const openEditor = () => {
    setDraft({ ...user });
    setSelectedPhoto(null);
    setIsEditing(true);
  };

  const pickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
        base64: true,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert(
          'No se pudo leer la foto',
          'Elige otra imagen e inténtalo nuevamente.',
        );
        return;
      }

      setSelectedPhoto({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.mimeType ?? 'image/jpeg',
      });
      setDraft((current) => ({ ...current, photoURL: asset.uri }));
    } catch (error) {
      console.error('No se pudo abrir la galería de fotos.', error);
      Alert.alert('No se pudo abrir la galería', 'Intenta nuevamente.');
    }
  };

  const saveProfile = async () => {
    if (isSaving) return;
    if (!draft.name.trim()) {
      Alert.alert('Falta tu nombre', 'Escribe el nombre que quieres mostrar en tu perfil.');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Inicia sesión', 'Vuelve a iniciar sesión para editar tu perfil.');
      return;
    }

    setIsSaving(true);
    try {
      let photoURL = user.photoURL;
      let photoPath = user.photoPath;
      const storage = getStorage(app);
      if (selectedPhoto) {
        const imageRef = ref(
          storage,
          `users/${currentUser.uid}/profile-${Date.now()}`,
        );
        await uploadString(imageRef, selectedPhoto.base64, 'base64', {
          contentType: selectedPhoto.mimeType,
        });
        photoURL = await getDownloadURL(imageRef);
        photoPath = imageRef.fullPath;
      } else {
        photoURL = draft.photoURL;
        photoPath = draft.photoPath;
      }

      const updatedProfile: UserProfile = {
        name: draft.name.trim(),
        email: currentUser.email ?? draft.email,
        phone: draft.phone.trim(),
        location: draft.location.trim(),
        homeAddress: draft.homeAddress.trim(),
        photoURL,
        photoPath,
      };

      await setDoc(doc(db, 'users', currentUser.uid), {
        ...updatedProfile,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setUser(updatedProfile);
      setIsEditing(false);
      setSelectedPhoto(null);
      if (user.photoPath && user.photoPath !== photoPath) {
        void deleteObject(ref(storage, user.photoPath)).catch((error: unknown) => {
          console.error('No se pudo borrar la foto de perfil anterior.', error);
        });
      }
      Alert.alert('Perfil actualizado', 'Tus datos se guardaron en Firebase.');
    } catch (error) {
      const code = getFirebaseAuthErrorCode(error);
      console.error('No se pudo guardar el perfil en Firebase.', error);
      const message =
        code === 'storage/unauthorized' || code === 'permission-denied'
          ? 'Firebase rechazó el guardado. Revisa las reglas de Firestore y Storage del proyecto.'
          : code === 'storage/bucket-not-found' || code === 'storage/no-default-bucket'
            ? 'Activa Firebase Storage y verifica que el bucket esté configurado.'
            : 'No se pudo guardar tu perfil o foto. Revisa tu conexión e inténtalo de nuevo.';
      Alert.alert('No se guardaron los cambios', message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenFrame activeTab="Profile">
      <View style={styles.profileHero}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Editar foto y datos del perfil"
          onPress={openEditor}
          style={styles.avatarLarge}
        >
          {user.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={styles.avatarPhoto}
              accessibilityLabel="Foto de perfil"
            />
          ) : (
            <Text style={styles.avatarEmoji}>
              {user.name.trim().charAt(0).toUpperCase() || '👤'}
            </Text>
          )}
        </TouchableOpacity>
        <View style={styles.profileIdentity}>
          <Text style={styles.profileName}>{user.name || 'Tu perfil'}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <Text style={styles.profileLocation}>
            📍 {user.location || 'Agrega tu ciudad o corregimiento'}
          </Text>
          {user.homeAddress ? (
            <Text style={styles.profileLocation} numberOfLines={2}>
              Casa: {user.homeAddress}
            </Text>
          ) : null}
          <Text style={styles.verifiedBadge}>✓  Usuario verificado</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <StatCard icon="▣" value={String(cartCount)} label="Productos en carrito" />
        <StatCard icon="♥" value="8" label="Favoritos" />
        <StatCard icon="★" value="320" label="Puntos" />
      </View>
      <SectionTitle title="Mi información" />
      <ProfileRow
        icon="♙"
        title="Editar perfil"
        detail="Foto, teléfono y domicilio"
        onPress={openEditor}
      />
      <ProfileRow
        icon="⌖"
        title="Dirección de casa"
        detail={
          user.homeAddress
            ? `${user.homeAddress}${user.location ? ` · ${user.location}` : ''}`
            : 'Agrega dónde vives y recibes tus pedidos'
        }
        onPress={openEditor}
      />
      <ProfileRow
        icon="▣"
        title="Métodos de pago"
        detail="Visa, Clave, efectivo o Yappy · modo de prueba"
        onPress={() => navigation.navigate('Checkout')}
      />
      <ProfileRow
        icon="♧"
        title="Notificaciones"
        detail="Ofertas y novedades"
        onPress={() => Alert.alert('Notificaciones', 'Tus notificaciones están activadas.')}
      />
      <SectionTitle title="Mis pedidos" action="Actualizar" onPress={loadOrders} />
      {isLoadingOrders ? (
        <Text style={styles.bodyText}>Cargando pedidos guardados en Firebase…</Text>
      ) : null}
      {ordersError ? (
        <Text style={modalStyles.ordersError}>{ordersError}</Text>
      ) : null}
      {!isLoadingOrders && !ordersError && orders.length === 0 ? (
        <Text style={styles.bodyText}>Todavía no tienes pedidos guardados.</Text>
      ) : null}
      {orders.map((order) => (
        <View key={order.id} style={modalStyles.orderCard}>
          <View style={modalStyles.orderHeading}>
            <Text style={modalStyles.orderId}>
              Pedido #{order.id.slice(-6).toUpperCase()}
            </Text>
            <Text style={modalStyles.orderTotal}>{formatPrice(order.total)}</Text>
          </View>
          <Text style={modalStyles.orderInfo}>{order.status}</Text>
          <Text style={modalStyles.orderInfo}>{order.createdAt}</Text>
        </View>
      ))}
      <SectionTitle title="Acceso rápido" />
      <ProfileRow
        icon="♥"
        title="Mis favoritos"
        detail="Tus productos guardados"
        onPress={() => navigation.navigate('Favorites')}
      />
      <ProfileRow
        icon="?"
        title="Ayuda y soporte"
        detail="Estamos para ayudarte"
        onPress={() => Alert.alert('Ayuda', 'Escríbenos a ayuda@vidasana.example')}
      />
      <ProfileRow
        icon="↪"
        title="Cerrar sesión"
        detail="Volver a la pantalla de acceso"
        onPress={async () => {
          try {
            await signOut(auth);
          } catch (error) {
            Alert.alert(
              'No se pudo cerrar sesión',
              error instanceof Error ? error.message : 'Intenta nuevamente.',
            );
          }
        }}
      />
      <View style={styles.welcomeNote}>
        <Text style={styles.welcomeIcon}>🌿</Text>
        <Text style={styles.welcomeText}>
          Tu salud es lo más importante. Gracias por ser parte de VidaSana+.
        </Text>
      </View>

      <Modal
        animationType="slide"
        onRequestClose={() => setIsEditing(false)}
        transparent
        visible={isEditing}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={modalStyles.backdrop}
        >
          <View style={modalStyles.sheet}>
            <View style={modalStyles.heading}>
              <Text style={modalStyles.title}>Editar mi perfil</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                disabled={isSaving}
                onPress={() => setIsEditing(false)}
              >
                <Text style={modalStyles.close}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={modalStyles.photoSection}>
                {draft.photoURL ? (
                  <Image source={{ uri: draft.photoURL }} style={modalStyles.photo} />
                ) : (
                  <View style={[modalStyles.photo, modalStyles.photoPlaceholder]}>
                    <Text style={modalStyles.photoInitial}>
                      {draft.name.trim().charAt(0).toUpperCase() || '👤'}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={isSaving}
                  onPress={pickPhoto}
                  style={modalStyles.photoButton}
                >
                  <Text style={modalStyles.photoButtonText}>Cambiar foto</Text>
                </TouchableOpacity>
              </View>

              <ProfileInput
                label="Nombre"
                value={draft.name}
                onChangeText={(name) => setDraft((current) => ({ ...current, name }))}
                placeholder="Tu nombre"
              />
              <ProfileInput
                label="Correo de la cuenta"
                value={user.email}
                editable={false}
                placeholder="Correo"
              />
              <ProfileInput
                label="Teléfono"
                value={draft.phone}
                onChangeText={(phone) => setDraft((current) => ({ ...current, phone }))}
                keyboardType="phone-pad"
                placeholder="+507"
              />
              <ProfileInput
                label="Ciudad o corregimiento"
                value={draft.location}
                onChangeText={(location) =>
                  setDraft((current) => ({ ...current, location }))
                }
                placeholder="Ej. San Francisco, Panamá"
              />
              <ProfileInput
                label="Dirección de casa"
                value={draft.homeAddress}
                onChangeText={(homeAddress) =>
                  setDraft((current) => ({ ...current, homeAddress }))
                }
                placeholder="Calle, edificio, casa o referencia"
                multiline
              />
              <Text style={modalStyles.emailNote}>
                El correo de acceso no se cambia desde esta pantalla.
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ disabled: isSaving }}
                disabled={isSaving}
                onPress={saveProfile}
                style={[modalStyles.saveButton, isSaving && modalStyles.disabled]}
              >
                <Text style={modalStyles.saveText}>
                  {isSaving ? 'Subiendo y guardando…' : 'Guardar cambios'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                disabled={isSaving}
                onPress={() => setIsEditing(false)}
                style={modalStyles.cancelButton}
              >
                <Text style={modalStyles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenFrame>
  );
}

function ProfileInput({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  keyboardType = 'default',
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText?: (value: string) => void;
  placeholder: string;
  editable?: boolean;
  keyboardType?: 'default' | 'phone-pad';
  multiline?: boolean;
}) {
  return (
    <View style={modalStyles.field}>
      <Text style={modalStyles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        editable={editable}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8492a6"
        style={[
          modalStyles.input,
          !editable && modalStyles.inputDisabled,
          multiline && modalStyles.multiline,
        ]}
        value={value}
      />
    </View>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProfileRow({
  icon,
  title,
  detail,
  onPress,
}: {
  icon: string;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={styles.profileRow}
    >
      <Text style={styles.profileRowIcon}>{icon}</Text>
      <View style={styles.profileRowCopy}>
        <Text style={styles.profileRowTitle}>{title}</Text>
        <Text style={styles.profileRowDetail}>{detail}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#102d5966',
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: { color: '#143257', fontWeight: '800', fontSize: 20 },
  close: { color: '#718096', fontSize: 30, lineHeight: 32, paddingHorizontal: 7 },
  photoSection: { alignItems: 'center', marginVertical: 12 },
  photo: { width: 88, height: 88, borderRadius: 44 },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e9f8ed',
  },
  photoInitial: { color: '#078447', fontSize: 34, fontWeight: '700' },
  photoButton: { paddingVertical: 9, paddingHorizontal: 14 },
  photoButtonText: { color: '#078447', fontSize: 13, fontWeight: '700' },
  field: { marginTop: 9 },
  label: { color: '#143257', fontSize: 12, fontWeight: '700', marginBottom: 5 },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#d8e0e9',
    borderRadius: 12,
    paddingHorizontal: 12,
    color: '#17335e',
    backgroundColor: '#fff',
    fontSize: 14,
  },
  inputDisabled: { backgroundColor: '#f1f4f6', color: '#718096' },
  multiline: { minHeight: 72, paddingTop: 11, textAlignVertical: 'top' },
  emailNote: { color: '#718096', fontSize: 10, marginTop: 8 },
  ordersError: { color: '#b42318', fontSize: 12, marginBottom: 8 },
  orderCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3eaf0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  orderHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: { color: '#143257', fontSize: 12, fontWeight: '700' },
  orderTotal: { color: '#078447', fontSize: 13, fontWeight: '800' },
  orderInfo: { color: '#718096', fontSize: 10, marginTop: 4 },
  saveButton: {
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: '#078447',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  saveText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  disabled: { opacity: 0.6 },
  cancelButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#718096', fontSize: 13, fontWeight: '700' },
});
