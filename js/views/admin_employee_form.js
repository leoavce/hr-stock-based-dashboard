// js/views/admin_employee_form.js
import { db, COL } from "../firebase.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { toast } from "../ui.js";

export function EmployeeFormView(){
  return `
  <section class="max-w-[860px] mx-auto px-5 md:px-10 py-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl md:text-4xl font-extrabold">직원 추가</h2>
      <a href="#/employees" class="btn btn-soft">목록</a>
    </div>
    <div class="hr-card p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div><label>이름 *</label><input id="emp-name" class="mt-2 w-full" required/></div>
        <div><label>사번 *</label><input id="emp-no" class="mt-2 w-full" required/></div>
        <div><label>이메일</label><input id="emp-email" type="email" class="mt-2 w-full"/></div>
        <div><label>부서</label><input id="emp-dept" class="mt-2 w-full"/></div>
        <div><label>입사일</label><input id="emp-join" type="date" class="mt-2 w-full"/></div>
        <div><label>상태</label>
          <select id="emp-status" class="mt-2 w-full">
            <option value="ACTIVE">ACTIVE</option>
            <option value="LEAVE">LEAVE</option>
            <option value="TERMINATED">TERMINATED</option>
          </select>
        </div>
      </div>
      <div class="flex gap-2 mt-6">
        <button id="btn-save-emp" class="btn btn-primary">저장</button>
        <a href="#/employees" class="btn">취소</a>
      </div>
    </div>
  </section>`;
}

export function bindEmployeeForm(){
  document.getElementById("btn-save-emp").addEventListener("click", async()=>{
    const name = document.getElementById("emp-name").value?.trim();
    const empNo = document.getElementById("emp-no").value?.trim();
    const email = document.getElementById("emp-email").value?.trim() || null;
    const dept = document.getElementById("emp-dept").value?.trim() || null;
    const joinStr = document.getElementById("emp-join").value;
    const status = document.getElementById("emp-status").value || "ACTIVE";

    if(!name || !empNo){ return toast("이름/사번은 필수입니다."); }
    const joinDate = joinStr ? new Date(joinStr+"T00:00:00") : null;
    if(joinStr && isNaN(joinDate)) return toast("입사일 형식이 잘못되었습니다.");

    try{
      const ref = await addDoc(collection(db, COL.EMP), { name, empNo, email, dept, joinDate, status });
      toast("직원 추가 완료");
      location.hash = "#/employees";
    }catch(e){
      console.error(e);
      toast("저장 실패: "+(e.code || e.message));
    }
  });
}
