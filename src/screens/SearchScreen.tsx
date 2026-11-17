import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CATEGORIES, PRODUCTS, RESTAURANTS } from '../data/catalog';
import { RootStackParamList } from '../types/navigation';
import {
  BrandHeader,
  ProductRow,
  RestaurantCard,
  ScreenFrame,
  SectionTitle,
} from '../components/store/StoreComponents';
import { COLORS, styles } from '../styles/store';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function SearchScreen({ navigation, route }: Props) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    route.params?.category ?? 'Todas',
  );
  const filteredProducts = useMemo(
    () =>
      PRODUCTS.filter((product) => {
        const matchesQuery = product.name
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        const matchesCategory =
          selectedCategory === 'Todas' || product.category === selectedCategory;
        return matchesQuery && matchesCategory;
      }),
    [query, selectedCategory],
  );
  const filteredRestaurants = useMemo(
    () =>
      RESTAURANTS.filter((restaurant) => {
        const matchesCategory =
          selectedCategory === 'Todas' || selectedCategory === 'Restaurantes';
        const searchableText = [
          restaurant.name,
          restaurant.cuisine,
          restaurant.neighborhood,
          restaurant.description,
          restaurant.tag,
        ]
          .join(' ')
          .toLowerCase();
        return (
          matchesCategory &&
          searchableText.includes(query.trim().toLowerCase())
        );
      }),
    [query, selectedCategory],
  );
  const showRestaurants =
    selectedCategory === 'Todas' || selectedCategory === 'Restaurantes';

  return (
    <ScreenFrame activeTab="Search">
      <BrandHeader subtitle="Encuentra algo saludable" />
      <View style={styles.searchInputWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          accessibilityLabel="Buscar productos y comidas"
          placeholder="Comida saludable"
          placeholderTextColor={COLORS.muted}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clearSearch}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
      >
        {['Todas', ...CATEGORIES].map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.chip,
              selectedCategory === category && styles.chipSelected,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                selectedCategory === category && styles.chipTextSelected,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.locationText}>Cerca de ti · Panamá, Panamá</Text>
      {showRestaurants ? (
        <>
          <SectionTitle title="Restaurantes" />
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </>
      ) : null}
      {selectedCategory !== 'Restaurantes' ? (
        <>
          <SectionTitle title="Opciones saludables" action="Ordenar: Relevancia" />
          {filteredProducts.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
            onPress={() =>
              navigation.navigate('ProductDetail', { productId: product.id })
            }
          />
          ))}
        </>
      ) : null}
      {!filteredProducts.length && !filteredRestaurants.length ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No encontramos resultados</Text>
          <Text style={styles.mutedText}>
            Prueba otra búsqueda o categoría.
          </Text>
        </View>
      ) : null}
    </ScreenFrame>
  );
}

