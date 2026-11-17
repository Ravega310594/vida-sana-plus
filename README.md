# 🌱 VidaSana+ (miAppMovil)

> **Tu salud, en tus manos** — app de comida saludable, productos frescos y restaurantes cerca de ti. Platos frescos, recetas y productos que te cuidan: *hoy empieza tu mejor versión.*

<p align="center">
  <img src="assets/icon.png" width="120" alt="VidaSana+ logo" />
</p>

---

## ✨ Funcionalidades

- 🏠 **Home** — hero con slogan, búsqueda, categorías (Comidas, Productos, Restaurantes), restaurantes cercanos y productos destacados con carrito
- 🔍 **Búsqueda** — filtra por texto y categoría
- 🍽️ **Detalle de producto** — foto, descripción, calorías y etiquetas de salud
- 🛒 **Carrito y Checkout** — cantidades, total y flujo de compra
- ❤️ **Favoritos** — guarda tus productos preferidos
- 👤 **Perfil** — nombre, correo, teléfono, dirección y foto (con `expo-image-picker`)
- 🔐 **Autenticación completa con Firebase**
  - Correo/contraseña (login y registro)
  - Google Sign-In (`@react-native-google-signin`)
  - Apple Sign-In (`expo-apple-authentication`)
  - Facebook Login (`react-native-fbsdk-next`)
  - "Recuérdame" con `AsyncStorage` y mensajes de error amigables en web

## 🧱 Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | [Expo SDK 58](https://docs.expo.dev) + React Native 0.88 |
| Lenguaje | TypeScript |
| UI | React Native Reanimated, SVG, Gesture Handler, Safe Area |
| Web | react-native-web |
| Navegación | React Navigation 7 (native stack) |
| Backend | Firebase 13 (Auth + Firestore + Storage) |
| Estado | React Context (`StoreContext`) |
| Testing | Vitest |

## 🚀 Empezando

### Requisitos

- Node.js 18+
- npm (o bun)
- Expo Go en tu móvil (opcional, para pruebas en dispositivo)
- Un proyecto de Firebase con **Auth**, **Firestore** y **Storage** habilitados

### Instalación

```bash
git clone https://github.com/Ravega310594/vida-sana-plus.git
cd vida-sana-plus
npm install
```

### Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com).
2. Habilita **Authentication** (Email/Password, Google, Apple, Facebook según necesites), **Firestore** y **Storage**.
3. Copia la configuración web de Firebase (apiKey, authDomain, projectId, etc.) y agrégala a tu configuración de Firebase en `src/` (ver `src/context/StoreContext.tsx`).
4. Para Google Sign-In, define en `.env` (ver `.env.example`):

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_FACEBOOK_APP_ID=
EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN=
```

5. Despliega las reglas de seguridad si quieres usar las incluidas:

```bash
firebase deploy --only firestore:rules,storage
```

### Ejecutar

```bash
npm start        # servidor de desarrollo (web + Expo Go)
npm run web      # solo navegador → http://localhost:8081
npm run ios      # simulador iOS
npm run android  # emulador Android
```

> ⚠️ Algunas funciones nativas (Google Sign-In, Facebook, cámara) requieren un **development build** (`npx expo run:ios|android` o `eas build`); no funcionan dentro de Expo Go ni totalmente en web.

## 📁 Estructura del proyecto

```
vida-sana-plus/
├── App.tsx                     # Navegación raíz y providers
├── index.ts                    # Punto de entrada
├── app.json / app.config.js    # Configuración de Expo
├── firestore.rules             # Reglas de seguridad de Firestore
├── storage.rules               # Reglas de seguridad de Storage
├── firebase.json               # Config de Firebase CLI
└── src/
    ├── components/store/       # Componentes reutilizables (StoreComponents)
    ├── context/                # StoreContext: auth, carrito y favoritos
    ├── data/                   # Catálogo (productos, restaurantes, categorías) + tests
    ├── screens/                # Home, Search, ProductDetail, Checkout,
    │                           # Favorites, Profile, Login, Register
    ├── styles/                 # Sistema de estilos compartido
    ├── utils/                  # auth.ts, notify.ts + tests
    └── types/                  # Tipos de navegación
```

## 🧪 Scripts

| Comando | Descripción |
|---|---|
| `npm test` | Ejecuta los tests con Vitest |
| `npm run lint` | Lint con ESLint (config Expo) |
| `npx tsc --noEmit` | Verificación de tipos |
| `npx expo-doctor` | Diagnóstico de dependencias |

## 📦 Build con EAS

```bash
npx eas-cli build --profile development   # build de desarrollo
npx eas-cli build --profile preview       # build de pruebas
npx eas-cli submit                        # enviar a las tiendas
npx eas-cli update                        # actualizaciones over-the-air
```

## 🤝 Contribuir

1. Haz un fork y crea tu rama: `git checkout -b feature/mi-feature`
2. Antes de hacer commit, corre `npx tsc --noEmit`, `npm run lint` y `npm test`
3. Abre un Pull Request con una descripción clara

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).
