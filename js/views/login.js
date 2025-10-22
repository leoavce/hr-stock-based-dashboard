// js/views/login.js
import { auth } from "../firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { toast } from "../ui.js";

export function LoginView() {
  return `
  <section class="max-w-[420px] mx-auto px-6 py-12">
    <div class="hr-card p-6">
      <h1 class="text-2xl font-black mb-6">로그인</h1>
      <div class="space-y-4">
        <div>
          <label class="text-sm font-bold">이메일</label>
          <input id="email" type="email" class="mt-1 w-full" placeholder="name@naver.com"/>
        </div>
        <div>
          <label class="text-sm font-bold">비밀번호</label>
          <input id="password" type="password" class="mt-1 w-full" placeholder="********"/>
        </div>
        <button id="btn-login" class="w-full bg-primary text-white rounded-lg h-11 font-bold">로그인</button>
      </div>
    </div>
  </section>`;
}

export function bindLogin() {
  document.getElementById("btn-login")?.addEventListener("click", async () => {
    const email = document.getElementById("email").value?.trim();
    const password = document.getElementById("password").value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast("로그인 성공");
      location.hash = "#/dashboard";
    } catch (e) {
      console.error(e);
      toast("로그인 실패: " + (e.code || "오류"));
    }
  });
}
