// firebase config key setup

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getStorage } from 'firebase/storage';

// Web app's Firebase configuration
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
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
}

// Export auth and firestore instances
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = getStorage(firebase.app()); // Get modular storage from compat app
export {firebase};