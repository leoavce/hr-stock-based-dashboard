// js/views/grants_list.js
import { db, COL } from "../firebase.js";
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { fmt } from "../hr.js";

export function GrantsListView() {
  return `
  <section class="max-w-[1200px] mx-auto px-4 md:px-10 lg:px-40 py-8">
    <div class="flex items-end justify-between mb-6">
      <div>
        <h2 class="text-3xl font-black">부여 목록</h2>
        <p class="text-[#51946c]">내 보상 현황</p>
      </div>
    </div>
    <div class="hr-card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-background-light">
            <th class="px-4 py-3 text-left text-sm font-medium">부여 ID</th>
            <th class="px-4 py-3 text-left text-sm font-medium">유형</th>
            <th class="px-4 py-3 text-left text-sm font-medium">부여일</th>
            <th class="px-4 py-3 text-left text-sm font-medium">총 주식</th>
            <th class="px-4 py-3 text-left text-sm font-medium">베스팅%</th>
            <th class="px-4 py-3 text-right text-sm font-medium">보기</th>
          </tr>
        </thead>
        <tbody id="grants-tbody"></tbody>
      </table>
    </div>
  </section>`;
}

export async function bindGrantsList(user) {
  const q = query(
    collection(db, COL.GRANTS),
    where("userId", "==", user.uid),
    orderBy("grantDate", "desc")
  );
  const snap = await getDocs(q);

  const rows = [];
  snap.forEach(doc => {
    const g = { id: doc.id, ...doc.data() };
    const pct = Math.round(((g.vestedTotal || 0) / (g.totalShares || 1)) * 100);
    rows.push(`
      <tr class="table-row">
        <td class="px-4 py-3 text-sm">${g.id}</td>
        <td class="px-4 py-3 text-sm">${g.grantType || "-"}</td>
        <td class="px-4 py-3 text-sm">${fmt.date(g.grantDate?.toDate?.() || g.grantDate)}</td>
        <td class="px-4 py-3 text-sm">${fmt.int(g.totalShares)}</td>
        <td class="px-4 py-3 text-sm">${pct}%</td>
        <td class="px-4 py-3 text-right">
          <a href="#/grants/${g.id}" class="px-3 py-2 rounded bg-primary text-white text-sm font-bold">상세</a>
        </td>
      </tr>`);
  });

  document.getElementById("grants-tbody").innerHTML = rows.join("") || `
    <tr><td class="px-4 py-6 text-sm text-[#51946c]" colspan="6">부여가 없습니다.</td></tr>`;
}
