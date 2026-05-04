import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqV4vX9v6J1Vs_K24YVhY5LovToUL4Ipc",
  authDomain: "simplecaferesturant.firebaseapp.com",
  projectId: "simplecaferesturant",
  storageBucket: "simplecaferesturant.firebasestorage.app",
  messagingSenderId: "563779306170",
  appId: "1:563779306170:web:456a0e8af53d7fcd9f7883",
  measurementId: "G-WXDJ1RNSNB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
