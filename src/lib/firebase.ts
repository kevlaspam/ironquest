import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC9TzbHDjyhLMHUrmblyZLigE_s822RnrI",
  authDomain: "fitspark-2139f.firebaseapp.com",
  projectId: "fitspark-2139f",
  storageBucket: "fitspark-2139f.appspot.com",
  messagingSenderId: "907180730840",
  appId: "1:907180730840:web:1abf4d1d76f2af3a4f6aad"
};

let app;
let auth;
let db;

if (typeof window !== "undefined" && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };