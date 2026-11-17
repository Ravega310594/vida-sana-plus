import { useRef, useState } from 'react';
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../../miAppMovil/firebaseConfig';
import { formatPrice, PRODUCTS } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { RootStackParamList } from '../types/navigation';
import { BrandHeader, ScreenFrame, SectionTitle } from '../components/store/StoreComponents';
import { styles } from '../styles/store';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;
const PAYMENT_METHODS = [
  { id: 'Visa', label: 'Tarjeta Visa', icon: 'VISA', image: null },
  {
    id: 'Clave',
    label: 'Tarjeta Clave',
    icon: 'CLAVE',
    image: require('../../assets/icono clave.png'),
  },
  { id: 'Efectivo', label: 'Efectivo · USD', icon: '$', image: null },
  {
    id: 'Yappy',
    label: 'Yappy',
    icon: 'Y',
    image: require('../../assets/logo-yappy.png'),
  },
] as const;
type PaymentMethodId = (typeof PAYMENT_METHODS)[number]['id'];

function waitForFirestoreWrite<T>(write: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('FIRESTORE_WRITE_TIMEOUT')),
      timeoutMs,
    );
    write.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

export default function CheckoutScreen({ navigation }: Props) {
  const { cart, changeQuantity, clearCart, user } = useStore();
  const pendingOrderId = useRef<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('Visa');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardholderName, setCardholderName] = useState('Usuario de prueba');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/30');
  const [cvv, setCvv] = useState('123');
  const cartItems = PRODUCTS.filter((product) => (cart[product.id] ?? 0) > 0);
  const subtotal = cartItems.reduce(
    (total, product) => total + product.price * (cart[product.id] ?? 0),
    0,
  );
  const delivery = cartItems.length ? 1.5 : 0;
  const isCardPayment = paymentMethod === 'Visa' || paymentMethod === 'Clave';

  const handleCardNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim());
  };

  const handleExpiryChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
  };

  const placeOrder = async () => {
    if (isSubmitting) return;
    if (!cartItems.length) {
      Alert.alert('Tu carrito está vacío', 'Agrega una opción saludable para continuar.');
      return;
    }
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Inicia sesión', 'Necesitas una cuenta activa para guardar tu pedido.');
      return;
    }
    if (isCardPayment) {
      const cardDigits = cardNumber.replace(/\D/g, '');
      const [monthText, yearText] = expiry.split('/');
      const month = Number(monthText);
      const year = 2000 + Number(yearText);
      const today = new Date();
      const expirationIsValid =
        /^\d{2}\/\d{2}$/.test(expiry) &&
        month >= 1 &&
        month <= 12 &&
        (year > today.getFullYear() ||
          (year === today.getFullYear() && month >= today.getMonth() + 1));

      if (
        !cardholderName.trim() ||
        cardDigits.length !== 16 ||
        !expirationIsValid ||
        !/^\d{3,4}$/.test(cvv)
      ) {
        Alert.alert(
          'Revisa los datos de prueba',
          'Completa el nombre, número de tarjeta, vencimiento y CVV de prueba.',
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const orderId =
        pendingOrderId.current ?? doc(collection(db, 'orders')).id;
      pendingOrderId.current = orderId;
      await waitForFirestoreWrite(setDoc(doc(db, 'orders', orderId), {
        userId: currentUser.uid,
        customerEmail: currentUser.email ?? '',
        customerName: user.name,
        customerPhone: user.phone,
        deliveryAddress: [user.homeAddress, user.location]
          .filter(Boolean)
          .join(', '),
        items: cartItems.map((product) => {
          const quantity = cart[product.id] ?? 0;
          return {
            productId: product.id,
            name: product.name,
            category: product.category,
            unitPrice: product.price,
            quantity,
            lineTotal: product.price * quantity,
          };
        }),
        subtotal,
        delivery,
        total: subtotal + delivery,
        currency: 'USD',
        paymentMethod,
        paymentStatus: 'not_processed',
        status: 'received',
        createdAt: serverTimestamp(),
      }), 20000);
      pendingOrderId.current = null;
      clearCart();
      Alert.alert(
        'Pedido guardado',
        `Tu pedido ${orderId} se guardó correctamente. No se realizó ningún cobro.`,
      );
    } catch (error) {
      console.error('No se pudo guardar el pedido en Firestore.', error);
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String(error.code)
          : undefined;
      const details =
        error instanceof Error && error.message === 'FIRESTORE_WRITE_TIMEOUT'
          ? 'Firebase no confirmó el pedido en 20 segundos. Revisa tu conexión y las reglas de Firestore; puedes reintentar sin crear un pedido duplicado.'
          : code === 'permission-denied'
          ? 'Firebase rechazó el pedido. Revisa las reglas de Firestore del proyecto.'
          : code === 'unavailable'
            ? 'Firebase no está disponible. Revisa tu conexión e inténtalo de nuevo.'
            : code === 'failed-precondition'
              ? 'Verifica que Cloud Firestore esté habilitado en tu proyecto Firebase.'
              : error instanceof Error
                ? error.message
                : 'Revisa tu conexión e inténtalo de nuevo.';
      Alert.alert(
        'No se pudo guardar el pedido',
        details,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenFrame activeTab="Checkout">
      <BrandHeader subtitle="Revisa tu compra" />
      <Text style={styles.pageTitle}>Tu pedido</Text>
      {cartItems.length ? (
        cartItems.map((product) => (
          <View key={product.id} style={styles.cartRow}>
            <Image
              source={product.image}
              style={styles.cartImage}
              resizeMode="cover"
              accessibilityLabel={`Imagen de ${product.name}`}
            />
            <View style={styles.cartInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
            </View>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                accessibilityLabel="Disminuir cantidad"
                onPress={() => changeQuantity(product.id, -1)}
              >
                <Text style={styles.quantityButton}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{cart[product.id]}</Text>
              <TouchableOpacity
                accessibilityLabel="Aumentar cantidad"
                onPress={() => changeQuantity(product.id, 1)}
              >
                <Text style={styles.quantityButton}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.mutedText}>
            Explora el menú y agrega algo que te guste.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.primaryButtonText}>Explorar opciones</Text>
          </TouchableOpacity>
        </View>
      )}
      <SectionTitle
        title="Dirección de entrega"
        action="Editar en Perfil"
        onPress={() => navigation.navigate('Profile')}
      />
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => navigation.navigate('Profile')}
        style={styles.addressCard}
      >
        <Text style={styles.addressIcon}>⌖</Text>
        <View style={styles.cartInfo}>
          <Text style={styles.productName}>Casa</Text>
          <Text style={styles.bodyText}>
            {user.homeAddress || user.location
              ? [user.homeAddress, user.location].filter(Boolean).join(', ')
              : 'Agrega tu dirección en Perfil'}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
      <SectionTitle title="Método de pago" />
      {PAYMENT_METHODS.map((method) => (
        <TouchableOpacity
          key={method.id}
          accessibilityRole="radio"
          accessibilityState={{ checked: paymentMethod === method.id }}
          accessibilityLabel={method.label}
          onPress={() => setPaymentMethod(method.id)}
          style={[
            styles.paymentOption,
            paymentMethod === method.id && styles.paymentOptionSelected,
          ]}
        >
          <View
            style={[
              styles.paymentIcon,
              method.id === 'Visa' && styles.visaIcon,
              method.id === 'Clave' && styles.claveIcon,
              method.id === 'Efectivo' && styles.cashIcon,
              method.id === 'Yappy' && styles.yappyIcon,
            ]}
          >
            {method.image ? (
              <Image
                source={method.image}
                style={styles.paymentMethodImage}
                resizeMode="contain"
                accessibilityLabel={`Logo de ${method.label}`}
              />
            ) : (
              <Text style={styles.paymentIconText}>{method.icon}</Text>
            )}
          </View>
          <Text style={styles.paymentLabel}>{method.label}</Text>
          <Text style={styles.radio}>
            {paymentMethod === method.id ? '◉' : '◯'}
          </Text>
        </TouchableOpacity>
      ))}
      {isCardPayment ? (
        <View style={styles.paymentForm}>
          <Text style={styles.paymentFormTitle}>Datos de tarjeta de prueba</Text>
          <Text style={styles.paymentDemoNote}>
            Información ficticia precargada. No uses datos reales; no se realizará ningún cobro.
          </Text>
          <TextInput
            accessibilityLabel="Nombre en la tarjeta"
            autoCapitalize="words"
            onChangeText={setCardholderName}
            placeholder="Nombre en la tarjeta"
            placeholderTextColor="#8492a6"
            style={styles.paymentInput}
            value={cardholderName}
          />
          <TextInput
            accessibilityLabel="Número de tarjeta de prueba"
            keyboardType="number-pad"
            maxLength={19}
            onChangeText={handleCardNumberChange}
            placeholder="Número de tarjeta"
            placeholderTextColor="#8492a6"
            style={styles.paymentInput}
            value={cardNumber}
          />
          <View style={styles.paymentInputRow}>
            <TextInput
              accessibilityLabel="Vencimiento de tarjeta"
              keyboardType="number-pad"
              maxLength={5}
              onChangeText={handleExpiryChange}
              placeholder="MM/AA"
              placeholderTextColor="#8492a6"
              style={[styles.paymentInput, styles.paymentInputHalf]}
              value={expiry}
            />
            <TextInput
              accessibilityLabel="CVV de prueba"
              keyboardType="number-pad"
              maxLength={4}
              onChangeText={(value) => setCvv(value.replace(/\D/g, '').slice(0, 4))}
              placeholder="CVV"
              placeholderTextColor="#8492a6"
              secureTextEntry
              style={[styles.paymentInput, styles.paymentInputHalf]}
              value={cvv}
            />
          </View>
        </View>
      ) : null}
      {paymentMethod === 'Yappy' ? (
        <Text style={styles.paymentDemoNote}>
          Pago Yappy de prueba. El pedido se guardará sin iniciar un cobro.
        </Text>
      ) : null}
      <SectionTitle title="Resumen de pago" />
      <View style={styles.summaryCard}>
        <SummaryLine label="Subtotal" value={formatPrice(subtotal)} />
        <SummaryLine label="Entrega" value={formatPrice(delivery)} />
        <View style={styles.summaryDivider} />
        <SummaryLine
          label="Total"
          value={formatPrice(subtotal + delivery)}
          strong
        />
      </View>
      <TouchableOpacity
        accessibilityState={{ disabled: isSubmitting }}
        disabled={isSubmitting}
        style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
        onPress={placeOrder}
      >
        <Text style={styles.primaryButtonText}>
          {isSubmitting ? 'Guardando pedido…' : 'Guardar pedido de prueba'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.demoNote}>
        El pedido se guarda en Firebase al tocar el botón. No se cobra ni se guardan datos de tarjeta.
      </Text>
    </ScreenFrame>
  );
}

function SummaryLine({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.summaryLine}>
      <Text style={[styles.bodyText, strong && styles.summaryStrong]}>{label}</Text>
      <Text style={[styles.bodyText, strong && styles.summaryStrong]}>{value}</Text>
    </View>
  );
}

