// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// TODO: 프로젝트 생성 후 아래 값 교체
const firebaseConfig = {
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

// 컬렉션 명 상수
export const COL = {
  USERS: "users",
  GRANTS: "stock_grants",
  VESTS: "vesting_schedules",
  TAX: "tax_events",
  PRICE: "price_snapshots"
};

// 역할 클레임 키 (Custom Claims)
export const ROLES = {
  EMPLOYEE: "Employee",
  HR_ADMIN: "HR_Admin",
  FINANCE: "Finance",
};
