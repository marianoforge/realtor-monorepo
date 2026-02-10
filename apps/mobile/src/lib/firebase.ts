import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import type { Auth, User, UserCredential } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;
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

const { signInWithEmailAndPassword, signOut, onAuthStateChanged } =
  firebaseAuth;

export { app, auth, signInWithEmailAndPassword, signOut, onAuthStateChanged };
