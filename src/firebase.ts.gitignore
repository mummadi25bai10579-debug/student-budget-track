import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const env = (import.meta as any).env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDvkYOONpMjIlvdacxAyxUndKobn-PEu38",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "student-budget-tracker-48ec7.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "student-budget-tracker-48ec7",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "105475398945",
  appId: env.VITE_FIREBASE_APP_ID || "105475398945"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Ensure local persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Firebase persistence error:", error);
});

export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({
  display: 'popup'
});
