// js/views/employees_list.js
import { db, COL } from "../firebase.js";
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { fmt } from "../hr.js";

export function EmployeesListView(){
  return `
  <section class="max-w-[1280px] mx-auto px-5 md:px-10 py-8">
    <div class="flex items-end justify-between mb-6">
      <div>
        <h2 class="text-3xl md:text-4xl font-extrabold">직원 관리</h2>
        <p class="text-muted mt-1">부여와 연결할 직원 마스터</p>
      </div>
      <a class="btn btn-primary" href="#/employees/new">직원 추가</a>
    </div>
    <div class="hr-card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-white">
            <th class="px-4 py-3 text-left text-sm font-extrabold">직원ID</th>
            <th class="px-4 py-3 text-left text-sm font-extrabold">이름</th>
            <th class="px-4 py-3 text-left text-sm font-extrabold">사번</th>
            <th class="px-4 py-3 text-left text-sm font-extrabold">부서</th>
            <th class="px-4 py-3 text-left text-sm font-extrabold">입사일</th>
            <th class="px-4 py-3 text-left text-sm font-extrabold">상태</th>
          </tr>
        </thead>
        <tbody id="emp-tbody"></tbody>
      </table>
    </div>
  </section>`;
}

export async function bindEmployeesList(){
  const qy = query(collection(db, COL.EMP), orderBy("name","asc"));
  const snap = await getDocs(qy);
  const rows = [];
  snap.forEach(doc=>{
    const e = { id: doc.id, ...doc.data() };
    rows.push(`
      <tr class="table-row">
        <td class="px-4 py-3 text-sm">${e.id}</td>
        <td class="px-4 py-3 text-sm">${e.name||"-"}</td>
        <td class="px-4 py-3 text-sm">${e.empNo||"-"}</td>
        <td class="px-4 py-3 text-sm">${e.dept||"-"}</td>
        <td class="px-4 py-3 text-sm">${fmt.date(e.joinDate)||"-"}</td>
        <td class="px-4 py-3 text-sm">${e.status||"ACTIVE"}</td>
      </tr>`);
  });
  document.getElementById("emp-tbody").innerHTML = rows.join("") || `
    <tr><td class="px-4 py-6 text-sm text-muted" colspan="6">등록된 직원이 없습니다.</td></tr>`;
}
