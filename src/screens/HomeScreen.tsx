import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CATEGORY_IMAGES, CATEGORIES, PRODUCTS, RESTAURANTS } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { RootStackParamList } from '../types/navigation';
import {
  BrandHeader,
  ProductTile,
  RestaurantCard,
  ScreenFrame,
  SectionTitle,
} from '../components/store/StoreComponents';
import { styles } from '../styles/store';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({
  navigation,
}: Props) {
  const { user } = useStore();
  const featured = PRODUCTS.slice(0, 4);

  return (
    <ScreenFrame activeTab="Home">
      <BrandHeader />
      <TouchableOpacity
        style={styles.searchPreview}
        onPress={() => navigation.navigate('Search')}
      >
        <Text style={styles.searchIcon}>⌕</Text>
        <Text style={styles.searchPlaceholder}>
          Buscar comidas, productos o restaurantes...
        </Text>
      </TouchableOpacity>
      <View style={styles.heroCard}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Come sano, vive mejor</Text>
          <Text style={styles.heroDescription}>
            Recetas, productos y comidas saludables a tu alcance.
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.heroButtonText}>Explorar ahora  ›</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={PRODUCTS[0].image}
          style={styles.heroImage}
          resizeMode="cover"
          accessibilityLabel="Comida saludable"
        />
      </View>

      <View style={styles.categoryGrid}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={styles.categoryItem}
            onPress={() => navigation.navigate('Search', { category })}
          >
            <Image source={CATEGORY_IMAGES[category]} style={styles.categoryImage} />
            <Text style={styles.categoryLabel}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionTitle
        title="Restaurantes cerca de ti"
        action="Ver todos ›"
        onPress={() => navigation.navigate('Search')}
      />
      <View style={styles.restaurantRow}>
        {RESTAURANTS.slice(0, 3).map((restaurant) => (
          <TouchableOpacity
            key={restaurant.id}
            onPress={() => navigation.navigate('Search', { category: 'Restaurantes' })}
            style={styles.restaurantCardPressable}
            accessibilityRole="button"
            accessibilityLabel={`Ver ${restaurant.name}`}
          >
            <RestaurantCard restaurant={restaurant} compact />
          </TouchableOpacity>
        ))}
      </View>

      <SectionTitle
        title="Productos destacados"
        action="Ver todos ›"
        onPress={() => navigation.navigate('Search')}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {featured.map((product) => (
          <ProductTile
            key={product.id}
            product={product}
            compact
            onPress={() =>
              navigation.navigate('ProductDetail', { productId: product.id })
            }
          />
        ))}
      </ScrollView>
      <View style={styles.welcomeNote}>
        <Text style={styles.welcomeIcon}>🌱</Text>
        <View style={styles.welcomeTextWrap}>
          <Text style={styles.welcomeTitle}>¡Hola, {user.name.split(' ')[0]}!</Text>
          <Text style={styles.welcomeText}>
            Tu próxima compra saludable está a un toque.
          </Text>
        </View>
      </View>
    </ScreenFrame>
  );
}
