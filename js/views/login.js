// js/views/login.js
import { auth } from "../firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { toast } from "../ui.js";

export function LoginView(){
  return `
  <section class="max-w-[460px] mx-auto px-6 py-14">
    <div class="hr-card p-8">
      <h1 class="text-3xl font-extrabold mb-6">관리자 로그인</h1>
      <div class="space-y-5">
        <div>
          <label>이메일</label>
          <input id="email" type="email" class="mt-2 w-full" placeholder="admin@naver.com"/>
        </div>
        <div>
          <label>비밀번호</label>
          <input id="password" type="password" class="mt-2 w-full" placeholder="********"/>
        </div>
        <button id="btn-login" class="btn btn-primary w-full text-lg">로그인</button>
      </div>
    </div>
  </section>`;
}

export function bindLogin(){
  document.getElementById("btn-login")?.addEventListener("click", async()=>{
    const email = document.getElementById("email").value?.trim();
    const password = document.getElementById("password").value;
    try{
      await signInWithEmailAndPassword(auth, email, password);
      toast("환영합니다");
      location.hash = "#/dashboard";
    }catch(e){
      console.error(e);
      toast("로그인 실패: "+(e.code||"오류"));
    }
  });
}
