// firebase config (TypeScript) - mirror of firebaseConfig.tsx to ensure extensionless imports resolve
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAU7auZBogfjflD8ycAMyrtEOJhFNBn-c8",
  authDomain: "health-app-cb517.firebaseapp.com",
  projectId: "health-app-cb517",
  storageBucket: "health-app-cb517.firebasestorage.app",
  messagingSenderId: "1085443182151",
  appId: "1:1085443182151:web:c0dc1420bddcf87d42ab62",
  measurementId: "G-CNJJMDBBMR"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = getStorage(firebase.app());
export const functions = firebase.functions();
export { firebase };
