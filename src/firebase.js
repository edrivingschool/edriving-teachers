
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyA2sy5JvlugZfpVJMfKrOPsqvoBtdXVSZw",
  authDomain: "e-driving-885fa.firebaseapp.com",
  projectId: "e-driving-885fa",
  storageBucket: "e-driving-885fa.appspot.com",
  messagingSenderId: "385664736922",
  appId: "1:385664736922:web:327f80b1619c43f5414923",
  measurementId: "G-3RWC9SNR95"
};
const app       = initializeApp(firebaseConfig);
export const auth      = getAuth(app);
export const firestore = getFirestore(app);

// Sign in anonymously on startup:
signInAnonymously(auth).catch(err => {
  console.error("Auth error:", err);
});

// Optional: listen for auth state
onAuthStateChanged(auth, user => {
  if (user) {
    console.log("Signed in as", user.uid);
  } else {
    console.log("Signed out");
  }
});
