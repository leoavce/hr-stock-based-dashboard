// js/auth.js
import { auth, googleProvider } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const emailEl = document.getElementById("email");
const pwEl = document.getElementById("password");
const togglePw = document.getElementById("toggle-pw");
const submitBtn = document.getElementById("submit-btn");
const googleBtn = document.getElementById("google-btn");
const forgotBtn = document.getElementById("forgot-btn");
const errorEl = document.getElementById("auth-error");
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");

let mode = "login"; // 'login' | 'signup'
tabLogin.addEventListener("change", () => {
  mode = "login";
  submitBtn.textContent = "Log In";
});
tabSignup.addEventListener("change", () => {
  mode = "signup";
  submitBtn.textContent = "Sign Up";
});

togglePw.addEventListener("click", () => {
  pwEl.type = pwEl.type === "password" ? "text" : "password";
});

function showError(msg) {
  errorEl.textContent = msg;
}

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";
  const email = emailEl.value.trim();
  const pw = pwEl.value.trim();
  if (!email || !pw) return showError("이메일/비밀번호를 입력해주세요.");

  try {
    if (mode === "login") {
      await signInWithEmailAndPassword(auth, email, pw);
    } else {
      await createUserWithEmailAndPassword(auth, email, pw);
    }
    // 성공 → 대시보드 이동
    window.location.href = "./dashboard.html";
  } catch (err) {
    showError(err.message);
  }
});

googleBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    window.location.href = "./dashboard.html";
  } catch (err) {
    showError(err.message);
  }
});

forgotBtn.addEventListener("click", async () => {
  const email = emailEl.value.trim();
  if (!email) return showError("비밀번호 재설정을 위해 이메일을 입력해주세요.");
  try {
    await sendPasswordResetEmail(auth, email);
    showError("비밀번호 재설정 메일을 보냈습니다. 메일함을 확인하세요.");
  } catch (err) {
    showError(err.message);
  }
});
