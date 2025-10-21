// js/guards.js
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const logoutBtn = document.getElementById("logout-btn");

onAuthStateChanged(auth, (user) => {
  const path = window.location.pathname;
  const isDashboard = path.endsWith("dashboard.html");
  if (!user && isDashboard) {
    window.location.replace("./index.html");
  }
  if (user && !isDashboard) {
    // 로그인 페이지에 있는데 이미 로그인되어 있다면
    // window.location.replace("./dashboard.html");
  }
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "./index.html";
  });
}
