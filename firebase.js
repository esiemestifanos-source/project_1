// ======================================================
// GEARSOULS - FIREBASE CONFIGURATION
// With Complete Error Handling
// ======================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDODZTg4XKIhkG4hxyFQISq_8qWMd7UvtU",
  authDomain: "gearsouls-5da31.firebaseapp.com",
  projectId: "gearsouls-5da31",
  storageBucket: "gearsouls-5da31.firebasestorage.app",
  messagingSenderId: "668054432272",
  appId: "1:668054432272:web:273393583b19feec4cb895",
  measurementId: "G-JCH0MVKVXH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Custom error messages
const errorMessages = {
  'auth/email-already-in-use': 'Email already exists. Please use another email or sign in.',
  'auth/invalid-email': 'Invalid email format. Please check and try again.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/user-not-found': 'No account found with this email. Please sign up first.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled.',
  'auth/requires-recent-login': 'Please log in again to complete this action.',
  'auth/user-disabled': 'This account has been disabled. Contact support.',
  'auth/invalid-credential': 'Invalid email or password. Please try again.'
};

export { auth, errorMessages };
