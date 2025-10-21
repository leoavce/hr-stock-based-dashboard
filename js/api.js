// js/api.js
import { db } from "./firebase.js";
import {
  collection, doc, getDocs, getDoc, setDoc, addDoc, query, where, orderBy, limit
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 컬렉션 경로 상수
export const COL = {
  GRANTS: "grants",                  // 부여
  VESTS: "vesting_schedules",        // 베스팅 일정
  TAX: "tax_events",                 // 행사/지급 세무 이벤트
};

// CRUD 래퍼
export async function listUserGrants(uid) {
  const q = query(collection(db, COL.GRANTS), where("userId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function listUserVests(uid, futureOnly = false) {
  const baseQ = query(collection(db, COL.VESTS), where("userId", "==", uid));
  const snap = await getDocs(baseQ);
  const now = new Date();
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return futureOnly ? items.filter(v => new Date(v.vestDate) >= now) : items;
}

export async function listRecentTaxEvents(uid, n = 10) {
  const q = query(
    collection(db, COL.TAX),
    where("userId", "==", uid),
    orderBy("eventDate", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addGrant(grant) {
  return addDoc(collection(db, COL.GRANTS), grant);
}
export async function addVest(vest) {
  return addDoc(collection(db, COL.VESTS), vest);
}
export async function addTaxEvent(evt) {
  return addDoc(collection(db, COL.TAX), evt);
}

export async function getGrant(id) {
  const ref = doc(db, COL.GRANTS, id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function setGrant(id, data) {
  const ref = doc(db, COL.GRANTS, id);
  return setDoc(ref, data, { merge: true });
}
