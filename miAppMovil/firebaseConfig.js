import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAk6K80iFi1uWROfeXPJPECZ1Hga4DTkDA",
  authDomain: "app-vida-sana-plus-84605.firebaseapp.com",
  projectId: "app-vida-sana-plus-84605",
  storageBucket: "app-vida-sana-plus-84605.firebasestorage.app",
  messagingSenderId: "998686705606",
  appId: "1:998686705606:web:66c972fdb854bbc10194c7"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error ? error.code : null;
    if (code !== "auth/already-initialized") {
      throw error;
    }
    auth = getAuth(app);
  }
}

const db = getFirestore(app);

export { app, auth, db };