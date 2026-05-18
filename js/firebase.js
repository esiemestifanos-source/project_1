// ========================================
// GEARSOULS - FIREBASE CONFIGURATION
// ========================================

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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Enable persistence so users stay logged in
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);