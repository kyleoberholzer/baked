// src/firebase/config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// You can import getAnalytics if you enabled it, otherwise you can remove it for now
import { getAnalytics } from "firebase/analytics";

// Import other Firebase services you plan to use:
import { getAuth } from "firebase/auth"; // For Authentication
import { getFirestore } from "firebase/firestore"; // For Firestore Database
import { getStorage } from "firebase/storage"; // For Cloud Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Only if you enabled Analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services you want to use and export them
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// You can also export analytics if you use it
export const analytics = getAnalytics(app);

// If you need the app instance itself elsewhere
export default app;
