// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQ6Wl8vPbP9dfXX9p4n98GEjUT9NJjdpo",
  authDomain: "whiskr-bead1.firebaseapp.com",
  projectId: "whiskr-bead1",
  storageBucket: "whiskr-bead1.firebasestorage.app",
  messagingSenderId: "661252559461",
  appId: "1:661252559461:web:83b0adb031a8519dbaec8c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
