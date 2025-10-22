// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// TODO: 실제 프로젝트 설정으로 교체
const firebaseConfig = {
  apiKey: "AIzaSyDkHDnimtrct-WAT93jjA0h5QGXISrYElc",
  authDomain: "stock-based-dash.firebaseapp.com",
  projectId: "stock-based-dash",
  appId: "1:54158559433:web:04ee1be85107804c596518"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
await setPersistence(auth, browserLocalPersistence);
export const db = getFirestore(app);

export const COL = {
  EMP: "employees",
  GRANTS: "stock_grants",
  VESTS: "vesting_schedules"
};
