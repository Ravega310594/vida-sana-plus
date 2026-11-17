import React from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatPrice, PRODUCTS, RESTAURANTS } from '../../data/catalog';
import { useStore } from '../../context/StoreContext';
import { RootStackParamList } from '../../types/navigation';
import { styles } from '../../styles/store';

export type TabName = 'Home' | 'Search' | 'Checkout' | 'Favorites' | 'Profile';

export function ScreenFrame({
  children,
  activeTab,
}: {
  children: React.ReactNode;
  activeTab: TabName;
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.screen}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        <BottomNavigation activeTab={activeTab} />
      </View>
    </SafeAreaView>
  );
}

function BottomNavigation({ activeTab }: { activeTab: TabName }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { cartCount } = useStore();
  const tabs: { name: TabName; label: string; icon: string }[] = [
    { name: 'Home', label: 'Inicio', icon: '⌂' },
    { name: 'Search', label: 'Buscar', icon: '⌕' },
    { name: 'Checkout', label: 'Carrito', icon: '🛒' },
    { name: 'Favorites', label: 'Favoritos', icon: '♡' },
    { name: 'Profile', label: 'Perfil', icon: '♙' },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const selected = tab.name === activeTab;
        return (
          <TouchableOpacity
            key={tab.name}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            onPress={() => navigation.navigate(tab.name)}
            style={styles.navItem}
          >
            <View>
              <Text style={[styles.navIcon, selected && styles.navIconActive]}>
                {tab.icon}
              </Text>
              {tab.name === 'Checkout' && cartCount > 0 ? (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.navLabel, selected && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function BrandHeader({ subtitle }: { subtitle?: string }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useStore();
  return (
    <View style={styles.brandHeader}>
      <View style={styles.brandMark}>
        <Image
          source={require('../../../assets/logo-up.png')}
          style={styles.brandLogo}
          accessibilityLabel="Logo de VidaSana+"
        />
      </View>
      <View style={styles.brandCopy}>
        <Text style={styles.brandName}>
          VidaSana<Text style={styles.brandPlus}>+</Text>
        </Text>
        <Text style={styles.brandSubtitle}>
          {subtitle ?? 'Tu salud, en tus manos'}
        </Text>
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Abrir perfil"
        style={styles.avatarSmall}
        onPress={() => navigation.navigate('Profile')}
      >
        {user.photoURL ? (
          <Image
            source={{ uri: user.photoURL }}
            style={styles.avatarSmallPhoto}
            accessibilityLabel="Foto de perfil"
          />
        ) : (
          <Text>{user.name.trim().charAt(0).toUpperCase() || '👤'}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export function SectionTitle({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.linkText}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function ProductTile({
  product,
  compact = false,
  onPress,
}: {
  product: (typeof PRODUCTS)[number];
  compact?: boolean;
  onPress: () => void;
}) {
  const { addToCart } = useStore();

  return (
    <View style={[styles.productTile, compact && styles.productTileCompact]}>
      <TouchableOpacity accessibilityRole="button" onPress={onPress}>
        <Image source={product.image} style={styles.productImage} resizeMode="cover" />
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.rating}>★ {product.rating}</Text>
      </TouchableOpacity>
      <View style={styles.priceLine}>
        <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Agregar ${product.name} al carrito`}
          onPress={() => addToCart(product.id)}
          hitSlop={6}
        >
          <Text style={styles.addCircle}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function ProductRow({
  product,
  onPress,
}: {
  product: (typeof PRODUCTS)[number];
  onPress: () => void;
}) {
  const { favorites, toggleFavorite } = useStore();
  const favorite = favorites.includes(product.id);
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={styles.productRow}
    >
      <Image source={product.image} style={styles.rowImage} resizeMode="cover" />
      <View style={styles.rowDetails}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.rowDescription} numberOfLines={2}>
          {product.tag} · {product.category}
        </Text>
        <Text style={styles.rating}>★ {product.rating} · 25-35 min</Text>
        <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={
          favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'
        }
        onPress={() => toggleFavorite(product.id)}
        style={styles.favoriteButton}
      >
        <Text style={styles.favoriteIcon}>{favorite ? '♥' : '♡'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export function RestaurantCard({
  restaurant,
  compact = false,
}: {
  restaurant: (typeof RESTAURANTS)[number];
  compact?: boolean;
}) {
  const openMap = async () => {
    if (!restaurant.mapUrl) return;
    try {
      await Linking.openURL(restaurant.mapUrl);
    } catch (error) {
      console.error('No se pudo abrir la ubicación del restaurante.', error);
      Alert.alert('No se pudo abrir el mapa', 'Intenta nuevamente más tarde.');
    }
  };

  return (
    <View style={[styles.restaurantCard, !compact && styles.restaurantCardFull]}>
      {restaurant.image ? (
        <Image
          source={restaurant.image}
          style={[styles.restaurantImage, !compact && styles.restaurantImageFull]}
          resizeMode="cover"
          accessibilityLabel={`Imagen de ${restaurant.name}`}
        />
      ) : (
        <View style={[styles.restaurantImage, styles.restaurantImageFallback]}>
          <Text style={styles.restaurantFallbackText}>Foto próximamente</Text>
        </View>
      )}
      <Text style={styles.restaurantName}>{restaurant.name}</Text>
      <Text style={styles.restaurantMeta} numberOfLines={compact ? 1 : undefined}>
        {restaurant.cuisine} · {restaurant.priceRange} · ★ {restaurant.rating}
      </Text>
      {!compact ? (
        <>
          <Text style={styles.restaurantDescription}>{restaurant.description}</Text>
          <Text style={styles.restaurantMeta}>{restaurant.tag}</Text>
          <Text style={styles.restaurantMeta}>
            {restaurant.neighborhood} · {restaurant.address}
          </Text>
          {restaurant.schedule ? (
            <Text style={styles.restaurantMeta}>{restaurant.schedule}</Text>
          ) : null}
          {restaurant.phone ? (
            <Text style={styles.restaurantMeta}>{restaurant.phone}</Text>
          ) : null}
          {restaurant.mapUrl ? (
            <TouchableOpacity
              accessibilityRole="link"
              onPress={openMap}
              style={styles.mapButton}
            >
              <Text style={styles.mapButtonText}>Ver en el mapa</Text>
            </TouchableOpacity>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

