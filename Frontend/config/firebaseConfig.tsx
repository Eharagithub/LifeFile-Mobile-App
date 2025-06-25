// firebase config key setup

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVL4efka1PUOtxnPKY6nSBlURy2C_Rw58",
  authDomain: "lifefile-app-7deab.firebaseapp.com",
  projectId: "lifefile-app-7deab",
  storageBucket: "lifefile-app-7deab.firebasestorage.app",
  messagingSenderId: "356353823669",
  appId: "1:356353823669:web:df3271ebbb17ec280dbffc",
  measurementId: "G-P7J050DBBJ"
};

if (!firebase.apps.length) {
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
}

// Export auth and firestore instances
export const auth = firebase.auth();
export const db = firebase.firestore();
export {firebase};