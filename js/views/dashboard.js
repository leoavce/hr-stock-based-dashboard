// js/views/dashboard.js
import { db, COL } from "../firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { fmt } from "../hr.js";

export function DashboardView(){
  return `
  <section class="max-w-[1280px] mx-auto px-5 md:px-10 py-8">
    <div class="flex items-end justify-between mb-7">
      <div>
        <h2 class="text-3xl md:text-4xl font-extrabold">대시보드</h2>
        <p class="text-muted mt-1">인사팀 관리자용 — 전체 데이터 한눈에</p>
      </div>
      <div class="flex gap-2">
        <a href="#/admin/new-grant" class="btn btn-primary">부여 등록</a>
        <a href="#/admin/csv" class="btn btn-soft">CSV 업로드</a>
      </div>
    </div>
    <div id="cards" class="grid grid-cols-1 md:grid-cols-3 gap-5"></div>
  </section>`;
}

export async function bindDashboard(){
  const snap = await getDocs(collection(db, COL.GRANTS));
  let total=0, vested=0, exercised=0;
  snap.forEach(d=>{
    const g = d.data();
    total += (g.totalShares||0);
    vested += (g.vestedTotal||0);
    exercised += (g.exercisedTotal||0);
  });

  document.getElementById("cards").innerHTML = `
    <div class="hr-card p-6"><p class="text-muted text-sm">총 부여</p><p class="text-4xl font-extrabold">${fmt.int(total)} 주</p></div>
    <div class="hr-card p-6"><p class="text-muted text-sm">베스팅 완료</p><p class="text-4xl font-extrabold">${fmt.int(vested)} 주</p></div>
    <div class="hr-card p-6"><p class="text-muted text-sm">행사 완료</p><p class="text-4xl font-extrabold">${fmt.int(exercised)} 주</p></div>
  `;
}
