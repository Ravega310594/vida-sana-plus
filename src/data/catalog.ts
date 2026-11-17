import type { ImageSourcePropType } from 'react-native';
import avocadoImage from '../../assets/comidas/aguacate fresco.jpg';
import fruitBowlImage from '../../assets/comidas/bowl frutas.jpg';
import vegetarianBowlImage from '../../assets/comidas/bowl-vegetariano-optimized.jpg';
import caesarImage from '../../assets/comidas/ensalada caesar.jpg';
import nutsImage from '../../assets/comidas/mix-frutos-secos-optimized.jpg';
import chickenImage from '../../assets/comidas/pollo-ensalada-optimized.jpg';
import salmonImage from '../../assets/comidas/salmon plancha con vegetales.jpg';

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: string;
  description: string;
  image: ImageSourcePropType;
  calories: number;
  tag: string;
};

export interface Restaurant {
  id: string;
  name: string;
  category: 'Restaurantes';
  rating: string;
  description: string;
  image?: ImageSourcePropType;
  address: string;
  neighborhood: string;
  cuisine: string;
  priceRange: '$' | '$$' | '$$$';
  schedule?: string;
  phone?: string;
  tag: string;
  mapUrl?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'pollo-ensalada',
    name: 'Pollo a la plancha con ensalada',
    category: 'Comidas',
    price: 7.5,
    rating: '4.8',
    description:
      'Pechuga de pollo a la plancha acompañada de ensalada fresca, quinoa y aguacate. Una opción balanceada y llena de energía.',
    image: chickenImage,
    calories: 420,
    tag: 'Alta en proteínas',
  },
  {
    id: 'ensalada-cesar',
    name: 'Ensalada César saludable',
    category: 'Comidas',
    price: 6.5,
    rating: '4.7',
    description:
      'Lechuga fresca, pollo a la plancha, tomate y crutones integrales con un aderezo ligero.',
    image: caesarImage,
    calories: 350,
    tag: 'Baja en calorías',
  },
  {
    id: 'salmon-vegetales',
    name: 'Salmón al horno con vegetales',
    category: 'Comidas',
    price: 8.5,
    rating: '4.9',
    description:
      'Salmón al horno servido con brócoli, zanahoria y arroz integral.',
    image: salmonImage,
    calories: 480,
    tag: 'Rico en omega 3',
  },
  {
    id: 'bowl-vegetariano',
    name: 'Bowl vegetariano',
    category: 'Comidas',
    price: 6.9,
    rating: '4.6',
    description:
      'Tofu, aguacate, quinoa, garbanzos y vegetales de temporada.',
    image: vegetarianBowlImage,
    calories: 390,
    tag: 'Vegetariano',
  },
  {
    id: 'aguacate',
    name: 'Aguacate fresco',
    category: 'Productos',
    price: 1.5,
    rating: '4.8',
    description: 'Aguacates frescos seleccionados, listos para disfrutar.',
    image: avocadoImage,
    calories: 160,
    tag: 'Producto fresco',
  },
  {
    id: 'frutos-secos',
    name: 'Mezcla de frutos secos',
    category: 'Productos',
    price: 4.5,
    rating: '4.7',
    description: 'Una mezcla de frutos secos, perfecta para una merienda.',
    image: nutsImage,
    calories: 210,
    tag: 'Energía natural',
  },
];

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'green-bowl-costa-del-este',
    name: 'Green Bowl',
    category: 'Restaurantes',
    rating: '4.8',
    description:
      'Bowls, ensaladas y jugos naturales preparados con ingredientes frescos.',
    image: fruitBowlImage,
    address: 'Dirección por confirmar',
    neighborhood: 'Costa del Este',
    cuisine: 'Saludable / Bowls',
    priceRange: '$$',
    schedule: 'Horario por confirmar',
    tag: 'Opciones vegetarianas',
    mapUrl: 'https://maps.google.com/?q=Green+Bowl+Costa+del+Este+Panama',
  },
  {
    id: 'fit-kitchen-san-francisco',
    name: 'Fit Kitchen',
    category: 'Restaurantes',
    rating: '4.7',
    description:
      'Comidas balanceadas, proteínas a la plancha y alternativas para llevar.',
    image: salmonImage,
    address: 'Dirección por confirmar',
    neighborhood: 'San Francisco',
    cuisine: 'Comida saludable',
    priceRange: '$$',
    schedule: 'Horario por confirmar',
    tag: 'Comidas balanceadas',
    mapUrl: 'https://maps.google.com/?q=Fit+Kitchen+San+Francisco+Panama',
  },
  {
    id: 'vida-sana-el-cangrejo',
    name: 'Vida Sana',
    category: 'Restaurantes',
    rating: '4.6',
    description:
      'Ensaladas, bowls vegetarianos y opciones frescas para cada día.',
    image: vegetarianBowlImage,
    address: 'Dirección por confirmar',
    neighborhood: 'El Cangrejo',
    cuisine: 'Saludable / Vegetariana',
    priceRange: '$',
    schedule: 'Horario por confirmar',
    tag: 'Opciones vegetarianas',
    mapUrl: 'https://maps.google.com/?q=Restaurante+saludable+El+Cangrejo+Panama',
  },
];

export const CATEGORIES = ['Comidas', 'Productos', 'Restaurantes'] as const;

export const CATEGORY_IMAGES = {
  Comidas: caesarImage,
  Productos: avocadoImage,
  Restaurantes: fruitBowlImage,
};

export const formatPrice = (price: number) => `$${price.toFixed(2)}`;
