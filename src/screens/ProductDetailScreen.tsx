import { Image, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { formatPrice, PRODUCTS } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { RootStackParamList } from '../types/navigation';
import { ScreenFrame, SectionTitle } from '../components/store/StoreComponents';
import { styles } from '../styles/store';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen({
  navigation,
  route,
}: Props) {
  const { addToCart, favorites, toggleFavorite } = useStore();
  const product = PRODUCTS.find((item) => item.id === route.params.productId);
  if (!product) {
    return (
      <ScreenFrame activeTab="Search">
        <Text style={styles.emptyTitle}>No encontramos este producto.</Text>
      </ScreenFrame>
    );
  }
  const favorite = favorites.includes(product.id);

  return (
    <ScreenFrame activeTab="Search">
      <View style={styles.detailTopBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Detalle del producto</Text>
        <TouchableOpacity
          onPress={() => toggleFavorite(product.id)}
          style={styles.backButton}
        >
          <Text style={styles.favoriteIcon}>{favorite ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.detailImage}>
        <Image
          source={product.image}
          style={styles.detailPhoto}
          resizeMode="cover"
          accessibilityLabel={`Imagen de ${product.name}`}
        />
        <View style={styles.imageCount}>
          <Text style={styles.imageCountText}>1 / 5</Text>
        </View>
      </View>
      <View style={styles.detailTitleRow}>
        <Text style={styles.detailTitle}>{product.name}</Text>
        <Text style={styles.detailPrice}>{formatPrice(product.price)}</Text>
      </View>
      <Text style={styles.rating}>★ {product.rating} (1.2k opiniones)</Text>
      <View style={styles.tagRow}>
        <Text style={styles.tag}>{product.category}</Text>
        <Text style={styles.tag}>{product.tag}</Text>
      </View>
      <View style={styles.infoStrip}>
        <Text style={styles.infoText}>25-35 min</Text>
        <Text style={styles.infoText}>1.2 km</Text>
      </View>
      <SectionTitle title="Descripción" />
      <Text style={styles.bodyText}>{product.description}</Text>
      <SectionTitle title="Ingredientes" />
      <View style={styles.tagRow}>
        {['Pollo', 'Lechuga', 'Tomate', 'Quinoa', 'Aguacate'].map((item) => (
          <Text key={item} style={styles.ingredientChip}>
            {item}
          </Text>
        ))}
      </View>
      <SectionTitle title="Información nutricional" />
      <View style={styles.nutritionRow}>
        <Nutrition value={String(product.calories)} label="Calorías" />
        <Nutrition value="35g" label="Proteína" />
        <Nutrition value="28g" label="Carbohidratos" />
        <Nutrition value="16g" label="Grasas" />
      </View>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => {
          addToCart(product.id);
          navigation.navigate('Checkout');
        }}
      >
        <Text style={styles.primaryButtonText}>＋  Agregar al carrito</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {
          addToCart(product.id);
          navigation.navigate('Checkout');
        }}
      >
        <Text style={styles.secondaryButtonText}>Comprar ahora</Text>
      </TouchableOpacity>
      <Text style={styles.deliveryNote}>Entrega a domicilio · 25-35 min</Text>
    </ScreenFrame>
  );
}

function Nutrition({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={styles.nutritionCard}>
      <Text style={styles.nutritionValue}>{value}</Text>
      <Text style={styles.nutritionLabel}>{label}</Text>
    </View>
  );
}

