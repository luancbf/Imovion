import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCo6FaIW1J_3sR0TzlRsk5f6e4wQVHQcuE",
  authDomain: "imovion-mt.firebaseapp.com",
  projectId: "imovion-mt",
  storageBucket: "imovion-mt.firebasestorage.app",
  messagingSenderId: "846996702846",
  appId: "1:846996702846:web:c6be716bdeee0e7cf83a2f",
  measurementId: "G-Z52XQ13ERH"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
