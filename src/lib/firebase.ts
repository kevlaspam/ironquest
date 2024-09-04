import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC9TzbHDjyhLMHUrmblyZLigE_s822RnrI",
  authDomain: "fitspark-2139f.firebaseapp.com",
  projectId: "fitspark-2139f",
  storageBucket: "fitspark-2139f.appspot.com",
  messagingSenderId: "907180730840",
  appId: "1:907180730840:web:1abf4d1d76f2af3a4f6aad"
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

app = getApps()[0];
db = getFirestore(app);
auth = getAuth(app);

export { app, db, auth };