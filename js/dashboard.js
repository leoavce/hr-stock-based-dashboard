// js/dashboard.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { listUserGrants, listUserVests, listRecentTaxEvents, addGrant, addVest, addTaxEvent } from "./api.js";
import { fmt, vestedValue, nextVesting, sumRecentTx } from "./utils.js";

const el = (id) => document.getElementById(id);

const kpiVestedValue = el("kpi-vested-value");
const kpiVestedDelta = el("kpi-vested-delta");
const kpiUpcomingShares = el("kpi-upcoming-shares");
const kpiUpcomingDate = el("kpi-upcoming-date");
const kpiRecentValue = el("kpi-recent-value");
const kpiRecentType = el("kpi-recent-type");
const chartTotal = el("chart-total");
const chartDelta = el("chart-delta");
const upcomingList = el("upcoming-list");
const txTbody = el("tx-tbody");
const seedBtn = el("seed-btn");

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  const uid = user.uid;

  // 데이터 로드
  const [grants, vests, tx] = await Promise.all([
    listUserGrants(uid),
    listUserVests(uid),
    listRecentTaxEvents(uid, 10)
  ]);

  // KPI 계산 (데모: 모든 베스팅 중 vested=true 합계)
  const vestedShares = vests.filter(v => v.vested === true).reduce((acc, v) => acc + (v.vestedShares || 0), 0);
  const totalVestedVal = vestedValue(vestedShares, 150);
  kpiVestedValue.textContent = fmt.money(totalVestedVal);
  kpiVestedDelta.textContent = "+5.2%"; // 데모용

  const upcoming = nextVesting(vests, 1);
  kpiUpcomingShares.textContent = upcoming.length ? fmt.int(upcoming[0].vestedShares) + " Shares" : "-";
  kpiUpcomingDate.textContent = upcoming.length ? new Date(upcoming[0].vestDate).toISOString().slice(0,10) : "-";

  const recentSum = sumRecentTx(tx);
  kpiRecentValue.textContent = fmt.money(recentSum);
  kpiRecentType.textContent = tx?.[0]?.type || "-";

  chartTotal.textContent = fmt.money(totalVestedVal);
  chartDelta.textContent = "+15.3%";

  // Upcoming 리스트 렌더
  renderUpcoming(vests);
  // 최근 거래 테이블 렌더
  renderTx(tx);

  // 시드 버튼
  seedBtn?.addEventListener("click", async () => {
    await seedDemo(uid);
    location.reload();
  });
});

function renderUpcoming(vests) {
  const items = nextVesting(vests, 4);
  upcomingList.innerHTML = items.map(v => `
    <div class="flex items-center gap-4">
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light/30 dark:bg-primary/30">
        <span class="material-symbols-outlined text-primary">calendar_today</span>
      </div>
      <div class="flex-1">
        <p class="font-bold">${fmt.date(v.vestDate)}</p>
        <p class="text-sm text-text-light/70 dark:text-text-dark/70">${fmt.int(v.vestedShares)} Shares</p>
      </div>
      <p class="font-semibold">~${fmt.money((v.vestedShares||0)*150)}</p>
    </div>
  `).join("");
}

function renderTx(tx) {
  txTbody.innerHTML = tx.map(t => `
    <tr class="border-b border-border-light dark:border-border-dark hover:bg-primary-light/10 dark:hover:bg-primary/10">
      <td class="p-4">${fmt.date(t.eventDate)}</td>
      <td class="p-4">
        <span class="rounded-full ${pillClass(t.type)} px-2 py-1 text-xs font-semibold">
          ${t.type}
        </span>
      </td>
      <td class="p-4">${fmt.int(t.shares)}</td>
      <td class="p-4 text-right font-medium">${fmt.money(t.value || 0)}</td>
    </tr>
  `).join("");
}
function pillClass(type) {
  if (type === "Sale") return "bg-red-500/20 text-red-700 dark:text-red-400";
  if (type === "Vest") return "bg-green-500/20 text-green-700 dark:text-green-400";
  return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
}

// 데모 데이터 주입
async function seedDemo(uid) {
  // 기본 부여 1건
  const grant = {
    userId: uid,
    grantType: "RSU",
    grantDate: "2024-05-15",
    totalShares: 2000,
    exercisePrice: 0,
    status: "active",
    symbol: "NAVR",
    grantFairValue: 140,
  };
  await addGrant(grant);

  // 베스팅(지난/다가오는) 샘플
  const today = new Date();
  const months = [-8, -5, -2, 1, 4, 7]; // 과거 3건, 미래 3건
  for (const m of months) {
    const d = new Date(today.getFullYear(), today.getMonth() + m, 15);
    const vested = d < today;
    await addVest({
      userId: uid,
      vestDate: d.toISOString(),
      vestedShares: m % 3 === 0 ? 200 : 150,
      vested,
    });
  }

  // 최근 거래
  await addTaxEvent({ userId: uid, type: "Sale", eventDate: new Date().toISOString(), shares: 39, value: 5820 });
  await addTaxEvent({ userId: uid, type: "Vest", eventDate: new Date(new Date().setMonth(new Date().getMonth()-2)).toISOString(), shares: 150, value: 21750 });
}
