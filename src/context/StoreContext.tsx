import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../miAppMovil/firebaseConfig';

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  location: string;
  homeAddress: string;
  photoURL: string;
  photoPath: string;
};

const EMPTY_USER: UserProfile = {
  name: '',
  email: '',
  phone: '',
  location: '',
  homeAddress: '',
  photoURL: '',
  photoPath: '',
};

type StoreContextValue = {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  cart: Record<string, number>;
  addToCart: (productId: string) => void;
  changeQuantity: (productId: string, change: number) => void;
  clearCart: () => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  cartCount: number;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(EMPTY_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<string[]>(['ensalada-cesar']);

  useEffect(
    () => {
      let isActive = true;
      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          setIsAuthenticated(firebaseUser !== null);
          if (!firebaseUser) {
            setUser(EMPTY_USER);
            setIsAuthLoading(false);
            return;
          }

          const fallbackProfile: UserProfile = {
            ...EMPTY_USER,
            name:
              firebaseUser.displayName ||
              firebaseUser.email?.split('@')[0] ||
              '',
            email: firebaseUser.email ?? '',
            photoURL: firebaseUser.photoURL ?? '',
          };
          setUser(fallbackProfile);
          setIsAuthLoading(false);

          void getDoc(doc(db, 'users', firebaseUser.uid))
            .then((snapshot) => {
              if (
                !isActive ||
                auth.currentUser?.uid !== firebaseUser.uid ||
                !snapshot.exists()
              ) {
                return;
              }

              const profile = snapshot.data();
              const stringValue = (value: unknown, fallback: string) =>
                typeof value === 'string' ? value : fallback;
              setUser({
                name: stringValue(profile.name, fallbackProfile.name),
                email: stringValue(profile.email, fallbackProfile.email),
                phone: stringValue(profile.phone, ''),
                location: stringValue(profile.location, ''),
                homeAddress: stringValue(profile.homeAddress, ''),
                photoURL: stringValue(profile.photoURL, fallbackProfile.photoURL),
                photoPath: stringValue(profile.photoPath, ''),
              });
            })
            .catch((error: unknown) => {
              console.error('No se pudo cargar el perfil desde Firestore.', error);
            });
        },
        (error) => {
          console.error('No se pudo restaurar la sesión de Firebase.', error);
          setIsAuthLoading(false);
        },
      );

      return () => {
        isActive = false;
        unsubscribe();
      };
    },
    [],
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      user,
      setUser,
      isAuthenticated,
      isAuthLoading,
      cart,
      addToCart: (productId) =>
        setCart((current) => ({
          ...current,
          [productId]: (current[productId] ?? 0) + 1,
        })),
      changeQuantity: (productId, change) =>
        setCart((current) => {
          const quantity = (current[productId] ?? 0) + change;
          if (quantity <= 0) {
            const next = { ...current };
            delete next[productId];
            return next;
          }
          return { ...current, [productId]: quantity };
        }),
      clearCart: () => setCart({}),
      favorites,
      toggleFavorite: (productId) =>
        setFavorites((current) =>
          current.includes(productId)
            ? current.filter((id) => id !== productId)
            : [...current, productId],
        ),
      cartCount: Object.values(cart).reduce((total, quantity) => total + quantity, 0),
    }),
    [cart, favorites, isAuthLoading, isAuthenticated, user],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore debe utilizarse dentro de StoreProvider');
  }
  return context;
}
