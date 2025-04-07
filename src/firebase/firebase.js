// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAk5w3jWyXf070Z-gDK4lEzYjgbTikSVFk",
  authDomain: "rowebros-156a6.firebaseapp.com",
  projectId: "rowebros-156a6",
  storageBucket: "rowebros-156a6.firebasestorage.app",
  messagingSenderId: "944129578600",
  appId: "1:944129578600:web:cd3d7be9df5dc256d98ddd",
  measurementId: "G-5FZYDXKQ2V"
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
