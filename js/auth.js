// js/auth.js
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { navigate, setAuthReady } from "./app.js";
import { toast } from "./ui.js";

const btn = document.getElementById("btn-logout");
btn.addEventListener("click", async()=>{
  await signOut(auth);
  toast("로그아웃 완료");
  navigate("#/login");
});

// 최초 1회 Auth 상태 결정 끝난 시점 알려주기
let initialResolved = false;
onAuthStateChanged(auth, (user)=>{
  if(!initialResolved){
    setAuthReady(true);   // <<< app.js에 준비 완료 신호
    initialResolved = true;
  }
  if(user){ navigate(location.hash || "#/dashboard", user); }
  else { navigate("#/login"); }
});
