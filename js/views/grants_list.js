// js/views/grants_list.js
import { db, COL } from "../firebase.js";
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { fmt } from "../hr.js";

export function GrantsListView(){
  return `
  <section class="max-w-[1280px] mx-auto px-5 md:px-10 py-8">
    <div class="flex items-end justify-between mb-6">
      <div>
        <h2 class="text-3xl md:text-4xl font-extrabold">부여 목록</h2>
        <p class="text-muted mt-1">전체 부여 건</p>
      </div>
      <a class="btn btn-primary" href="#/admin/new-grant">부여 등록</a>
    </div>
    <div class="hr-card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-white">
            <th class="px-4 py-4 text-left text-sm font-extrabold">부여 ID</th>
            <th class="px-4 py-4 text-left text-sm font-extrabold">유형</th>
            <th class="px-4 py-4 text-left text-sm font-extrabold">부여일</th>
            <th class="px-4 py-4 text-left text-sm font-extrabold">총 주식</th>
            <th class="px-4 py-4 text-left text-sm font-extrabold">베스팅%</th>
            <th class="px-4 py-4 text-right text-sm font-extrabold">관리</th>
          </tr>
        </thead>
        <tbody id="grants-tbody"></tbody>
      </table>
    </div>
  </section>`;
}

export async function bindGrantsList(){
  const q = query(collection(db, COL.GRANTS), orderBy("grantDate", "desc"));
  const snap = await getDocs(q);
  const rows = [];
  snap.forEach(doc=>{
    const g = { id:doc.id, ...doc.data() };
    const pct = Math.round(((g.vestedTotal||0)/(g.totalShares||1))*100);
    rows.push(`
      <tr class="table-row">
        <td class="px-4 py-3 text-sm">${g.id}</td>
        <td class="px-4 py-3 text-sm">${g.grantType||"-"}</td>
        <td class="px-4 py-3 text-sm">${fmt.date(g.grantDate)}</td>
        <td class="px-4 py-3 text-sm">${fmt.int(g.totalShares)}</td>
        <td class="px-4 py-3 text-sm">${pct}%</td>
        <td class="px-4 py-3 text-right">
          <a href="#/grants/${g.id}" class="btn btn-soft">상세</a>
        </td>
      </tr>`);
  });
  document.getElementById("grants-tbody").innerHTML = rows.join("") || `
    <tr><td class="px-4 py-6 text-sm text-muted" colspan="6">부여가 없습니다.</td></tr>`;
}
