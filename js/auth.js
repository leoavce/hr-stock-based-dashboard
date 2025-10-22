// js/auth.js
import { auth, googleProvider } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const emailEl = document.getElementById("email");
const pwEl = document.getElementById("password");
const pw2El = document.getElementById("password2");
const confirmWrap = document.getElementById("confirm-wrap");

const togglePw = document.getElementById("toggle-pw");
const submitBtn = document.getElementById("submit-btn");
const googleBtn = document.getElementById("google-btn");
const forgotBtn = document.getElementById("forgot-btn");
const errorEl = document.getElementById("auth-error");
const noticeEl = document.getElementById("auth-notice");
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");

let mode = "login"; // 'login' | 'signup'

function setMode(next) {
  mode = next;
  submitBtn.textContent = mode === "login" ? "Log In" : "Create Account";
  confirmWrap.style.display = mode === "signup" ? "flex" : "none";
  errorEl.textContent = "";
  noticeEl.classList.add("hidden");
  noticeEl.textContent = "";
}

tabLogin.addEventListener("change", () => setMode("login"));
tabSignup.addEventListener("change", () => setMode("signup"));
setMode("login");

togglePw.addEventListener("click", () => {
  pwEl.type = pwEl.type === "password" ? "text" : "password";
});

function showError(msg) {
  errorEl.textContent = msg;
}
function showNotice(msg) {
  noticeEl.textContent = msg;
  noticeEl.classList.remove("hidden");
}

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";
  noticeEl.classList.add("hidden");

  const email = emailEl.value.trim();
  const pw = pwEl.value.trim();
  if (!email || !pw) return showError("이메일/비밀번호를 입력해주세요.");

  try {
    if (mode === "login") {
      await signInWithEmailAndPassword(auth, email, pw);
      window.location.href = "./dashboard.html";
    } else {
      // signup
      const pw2 = pw2El.value.trim();
      if (pw.length < 8) return showError("비밀번호는 8자 이상을 권장합니다.");
      if (pw !== pw2) return showError("비밀번호가 일치하지 않습니다.");

      const cred = await createUserWithEmailAndPassword(auth, email, pw);
      await sendEmailVerification(cred.user);
      // 즉시 로그아웃하여 자동로그인 방지
      await signOut(auth);

      showNotice("가입 완료! 이메일 인증 후 로그인해주세요.");
      // 탭을 로그인으로 전환
      tabLogin.checked = true;
      setMode("login");
    }
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
    showNotice("비밀번호 재설정 메일을 보냈습니다. 메일함을 확인하세요.");
  } catch (err) {
    showError(err.message);
  }
});
