import { Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PRODUCTS } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { RootStackParamList } from '../types/navigation';
import {
  BrandHeader,
  ProductRow,
  ScreenFrame,
} from '../components/store/StoreComponents';
import { styles } from '../styles/store';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

export default function FavoritesScreen({ navigation }: Props) {
  const { favorites } = useStore();
  const favoriteProducts = PRODUCTS.filter((product) =>
    favorites.includes(product.id),
  );
  return (
    <ScreenFrame activeTab="Favorites">
      <BrandHeader subtitle="Tus opciones favoritas" />
      <Text style={styles.pageTitle}>Favoritos</Text>
      {favoriteProducts.length ? (
        favoriteProducts.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
            onPress={() =>
              navigation.navigate('ProductDetail', { productId: product.id })
            }
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>♡</Text>
          <Text style={styles.emptyTitle}>Aún no tienes favoritos</Text>
          <Text style={styles.mutedText}>
            Guarda las comidas que quieras encontrar fácilmente.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.primaryButtonText}>Buscar comidas</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenFrame>
  );
}

