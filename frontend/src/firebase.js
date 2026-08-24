import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
  onAuthStateChanged 
} from "firebase/auth";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAch-Ypq0zcgH_Ae2YQKDhp0Z3IxObAsY",
  authDomain: "civic-help-hub.firebaseapp.com",
  projectId: "civic-help-hub",
  storageBucket: "civic-help-hub.firebasestorage.app",
  messagingSenderId: "754952442522",
  appId: "1:754952442522:web:86f9af56b8dd41b7c3c523",
  measurementId: "G-GM9TMLXYJ6"
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
  onAuthStateChanged
};

export default app;
