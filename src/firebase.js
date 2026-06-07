import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

import { 
  getAuth 
} from "firebase/auth";

import { 
  getFirestore 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYeUENQpNWcEyVSugU9mPGX6Nszu6ijYg",

  authDomain: "broadcasthub-5e35a.firebaseapp.com",

  projectId: "broadcasthub-5e35a",

  storageBucket: "broadcasthub-5e35a.firebasestorage.app",

  messagingSenderId: "117578283408",

  appId: "1:117578283408:web:1f29c58c17e81df1a85b15"
};

const app = initializeApp(firebaseConfig);
export const storage =
  getStorage(app);

export const auth = getAuth(app);

export const db = getFirestore(app);