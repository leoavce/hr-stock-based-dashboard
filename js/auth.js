// js/auth.js
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { toast } from "./ui.js";
import { navigate } from "./app.js";

const btnLogout = document.getElementById("btn-logout");
btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  toast("로그아웃 되었습니다");
  navigate("#/login");
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    btnLogout.classList.remove("hidden");
    const route = location.hash || "#/dashboard";
    navigate(route, user);
  } else {
    btnLogout.classList.add("hidden");
    navigate("#/login");
  }
});
