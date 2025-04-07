// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAk5w3jWyXf070Z-gDK4lEzYjgbTikSVFk",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "rowebros-156a6.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "rowebros-156a6",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "rowebros-156a6.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "944129578600",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:944129578600:web:cd3d7be9df5dc256d98ddd",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-5FZYDXKQ2V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the Firebase services for use in other components
export { app, analytics, auth, db, storage };
