import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGJqKkzdbC2NeI6hIPsPNNhAHuMutuDjE",
  authDomain: "mygymgame.firebaseapp.com",
  projectId: "mygymgame",
  storageBucket: "mygymgame.appspot.com",
  messagingSenderId: "388540703810",
  appId: "1:388540703810:web:067d2fd683fcaca16fb9db"
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