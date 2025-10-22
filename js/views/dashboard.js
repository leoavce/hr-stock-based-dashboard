// js/views/dashboard.js
import { db, COL } from "../firebase.js";
import { collection, query, where, getDocs, limit } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { fmt } from "../hr.js";

export function DashboardView(user) {
  return `
  <section class="max-w-[1200px] mx-auto px-4 md:px-10 lg:px-40 py-8">
    <div class="flex items-end justify-between mb-6">
      <div>
        <h2 class="text-3xl font-black">대시보드</h2>
        <p class="text-[#51946c]">안녕하세요, ${user?.email || ""}</p>
      </div>
      <a href="#/grants" class="px-4 py-2 rounded bg-primary text-white font-bold">부여 목록 보기</a>
    </div>

    <div id="dash-cards" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 카드: 총 부여, 베스팅, 행사 -->
    </div>

    <div class="mt-8 hr-card p-4">
      <h3 class="text-lg font-black mb-3">다가오는 베스팅</h3>
      <div id="upcoming" class="space-y-2"></div>
    </div>
  </section>`;
}

export async function bindDashboard(user) {
  // 간단 합계(자신의 부여만)
  const q = query(collection(db, COL.GRANTS), where("userId", "==", user.uid), limit(100));
  const snap = await getDocs(q);
  let totalShares = 0, vestedShares = 0, exercisedShares = 0;

  const grants = [];
  snap.forEach(doc => {
    const g = { id: doc.id, ...doc.data() };
    grants.push(g);
    totalShares += (g.totalShares || 0);
    vestedShares += (g.vestedTotal || 0);
    exercisedShares += (g.exercisedTotal || 0);
  });

  document.getElementById("dash-cards").innerHTML = `
    <div class="hr-card p-5">
      <p class="text-sm text-[#51946c]">총 부여</p>
      <p class="text-3xl font-black">${fmt.int(totalShares)} 주</p>
    </div>
    <div class="hr-card p-5">
      <p class="text-sm text-[#51946c]">베스팅 완료</p>
      <p class="text-3xl font-black">${fmt.int(vestedShares)} 주</p>
    </div>
    <div class="hr-card p-5">
      <p class="text-sm text-[#51946c]">행사 완료</p>
      <p class="text-3xl font-black">${fmt.int(exercisedShares)} 주</p>
    </div>`;

  // 다가오는 베스팅 (샘플: 자신의 부여 문서에 nextVests 필드가 있다고 가정)
  const upcoming = grants.flatMap(g => (g.nextVests || []).map(v => ({grant: g, ...v}))).slice(0, 5);
  document.getElementById("upcoming").innerHTML = upcoming.length
    ? upcoming.map(v => `
        <div class="flex items-center justify-between p-3 rounded border border-[#e6efe9]">
          <div>
            <p class="font-bold">${new Date(v.date).toLocaleDateString("ko-KR")}</p>
            <p class="text-sm text-[#51946c]">Grant: ${gShort(v.grant.id)}</p>
          </div>
          <div class="text-right">
            <p class="font-black">${fmt.int(v.shares)} 주</p>
            <span class="badge badge-soft">${Math.round(v.ratio*100)}%</span>
          </div>
        </div>
      `).join("")
    : `<p class="text-sm text-[#51946c]">예정된 베스팅이 없습니다.</p>`;
}

function gShort(id) {
  return id.slice(0,6) + "..." + id.slice(-4);
}
