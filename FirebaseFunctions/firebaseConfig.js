// Author Google Inc/ Firebase Docs
//https://firebase.google.com/docs/auth/web/start#web-modular-api_2

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDs_lP3JjoNK-kM1vlzh90R5U78d9bknqI",
  authDomain: "clothingapp-6092d.firebaseapp.com",
  projectId: "clothingapp-6092d",
  storageBucket: "clothingapp-6092d.appspot.com",
  messagingSenderId: "566247507391",
  appId: "1:566247507391:web:3aac9b85117659d5c74d0a",
  measurementId: "G-M5PKLLYZML",
  databaseURL: "https://clothingapp-6092d-default-rtdb-firebase.com/",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { firebaseApp, auth, db, storage };
