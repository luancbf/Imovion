import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB7MWsEok6i-1NgfjUsIJMaL8sWTcgXJHo",
  authDomain: "imovion.firebaseapp.com",
  projectId: "imovion",
  storageBucket: "imovion.firebasestorage.app",
  messagingSenderId: "715689732466",
  appId: "1:715689732466:web:fde74b396735e787d095eb",
  measurementId: "G-19C0PG6JM4"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
