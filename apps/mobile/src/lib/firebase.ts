import { Platform } from "react-native";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import type { Auth, User, UserCredential } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseApiKey =
  Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_FIREBASE_API_KEY_IOS
    : process.env.EXPO_PUBLIC_FIREBASE_API_KEY_ANDROID;

interface FirebaseAuthRN {
  initializeAuth: (app: FirebaseApp, deps?: { persistence: unknown }) => Auth;
  getAuth: (app: FirebaseApp) => Auth;
  getReactNativePersistence: (storage: typeof AsyncStorage) => unknown;
  signInWithEmailAndPassword: (
    auth: Auth,
    email: string,
    password: string
  ) => Promise<UserCredential>;
  signOut: (auth: Auth) => Promise<void>;
  onAuthStateChanged: (
    auth: Auth,
    callback: (user: User | null) => void
  ) => () => void;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const firebaseAuth: FirebaseAuthRN = require("@firebase/auth/dist/rn/index.js");

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const hasValidConfig =
  typeof firebaseConfig.apiKey === "string" && firebaseConfig.apiKey.length > 0;

let app: FirebaseApp;
let auth: Auth;
let signInWithEmailAndPassword: (
  auth: Auth,
  email: string,
  password: string
) => Promise<UserCredential>;
let signOut: (auth: Auth) => Promise<void>;
let onAuthStateChanged: (
  auth: Auth,
  callback: (user: User | null) => void
) => () => void;

if (hasValidConfig) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  try {
    auth = firebaseAuth.initializeAuth(app, {
      persistence: firebaseAuth.getReactNativePersistence(AsyncStorage),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("already")) {
      auth = firebaseAuth.getAuth(app);
    } else {
      throw error;
    }
  }
  signInWithEmailAndPassword = firebaseAuth.signInWithEmailAndPassword;
  signOut = firebaseAuth.signOut;
  onAuthStateChanged = firebaseAuth.onAuthStateChanged;
} else {
  app =
    getApps().length > 0
      ? getApp()
      : initializeApp({ apiKey: "-", authDomain: "-", projectId: "-" });
  auth = firebaseAuth.getAuth(app);
  signInWithEmailAndPassword = () =>
    Promise.reject(
      new Error(
        "Firebase no configurado. Configure EXPO_PUBLIC_FIREBASE_API_KEY_ANDROID y EXPO_PUBLIC_FIREBASE_API_KEY_IOS en EAS y vuelva a generar el build."
      )
    );
  signOut = () => Promise.resolve();
  onAuthStateChanged = (_, callback) => {
    callback(null);
    return () => {};
  };
}

export { app, auth, signInWithEmailAndPassword, signOut, onAuthStateChanged };
