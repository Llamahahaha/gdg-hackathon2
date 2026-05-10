import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate config
const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined";

if (!isConfigValid) {
  console.warn("Firebase API Key is missing. Check your .env.local file.");
}

// Initialize Firebase only if it hasn't been initialized already and config is valid
const app = isConfigValid 
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : null;

const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

export { app, auth, db };
