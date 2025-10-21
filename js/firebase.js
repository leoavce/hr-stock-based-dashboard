// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth, setPersistence, browserLocalPersistence,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// TODO: Firebase Console > Project settings > Your apps > Config 복붙
export const firebaseConfig = {
  apiKey: "AIzaSyDkHDnimtrct-WAT93jjA0h5QGXISrYElc",
  authDomain: "stock-based-dash.firebaseapp.com",
  projectId: "stock-based-dash",
  storageBucket: "stock-based-dash.firebasestorage.app",
  messagingSenderId: "54158559433",
  appId: "1:54158559433:web:04ee1be85107804c596518"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// 유지(자동로그인)
setPersistence(auth, browserLocalPersistence).catch(console.error);
