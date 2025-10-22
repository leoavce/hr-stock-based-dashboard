// js/auth.js
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { navigate } from "./app.js";
import { toast } from "./ui.js";

const btn = document.getElementById("btn-logout");
btn.addEventListener("click", async()=>{
  await signOut(auth);
  toast("로그아웃 완료");
  navigate("#/login");
});

onAuthStateChanged(auth, (user)=>{
  if(user){ navigate(location.hash || "#/dashboard", user); }
  else { navigate("#/login"); }
});
