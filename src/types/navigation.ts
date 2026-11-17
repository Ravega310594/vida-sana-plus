export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Search: { category?: 'Comidas' | 'Productos' | 'Restaurantes' } | undefined;
  ProductDetail: { productId: string };
  Checkout: undefined;
  Favorites: undefined;
  Profile: undefined;
};
