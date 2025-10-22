// js/dashboard.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { listUserGrants, listUserVests, listRecentTaxEvents, addGrant, addVest, addTaxEvent } from "./api.js";
import { fmt, vestedValue, nextVesting, sumRecentTx } from "./utils.js";

const $ = (id) => document.getElementById(id);

// KPI refs
const kpiVestedValue = $("kpi-vested-value");
const kpiVestedDelta = $("kpi-vested-delta");
const kpiUpcomingShares = $("kpi-upcoming-shares");
const kpiUpcomingDate = $("kpi-upcoming-date");
const kpiRecentValue = $("kpi-recent-value");
const kpiRecentType = $("kpi-recent-type");
const chartTotal = $("chart-total");
const chartDelta = $("chart-delta");

// Lists/empty
const upcomingList = $("upcoming-list");
const upcomingEmpty = $("upcoming-empty");
const txTbody = $("tx-tbody");
const txEmpty = $("tx-empty");

// Quick actions
const seedBtn = $("seed-btn");
const qaGrantType = $("qa-grant-type");
const qaGrantShares = $("qa-grant-shares");
const qaGrantDate = $("qa-grant-date");
const qaGrantPrice = $("qa-grant-price");
const qaGrantSave = $("qa-grant-save");
const qaGrantMsg = $("qa-grant-msg");

const qaVestDate = $("qa-vest-date");
const qaVestShares = $("qa-vest-shares");
const qaVestVested = $("qa-vest-vested");
const qaVestSave = $("qa-vest-save");
const qaVestMsg = $("qa-vest-msg");

// Simulator
const simFmv = $("sim-fmv");
const simShares = $("sim-shares");
const simRun = $("sim-run");
const simResult = $("sim-result");

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  const uid = user.uid;

  await refresh(uid);

  // Seed demo
  seedBtn?.addEventListener("click", async () => {
    await seedDemo(uid);
    await refresh(uid);
  });

  // Save Grant
  qaGrantSave?.addEventListener("click", async () => {
    qaGrantMsg.textContent = "";
    const totalShares = parseInt(qaGrantShares.value || "0", 10);
    const grantDate = qaGrantDate.value;
    const type = qaGrantType.value;
    const exercisePrice = parseFloat(qaGrantPrice.value || "0");
    if (!totalShares || !grantDate) {
      qaGrantMsg.textContent = "필수값(날짜/주식수)을 입력하세요.";
      return;
    }
    const grant = {
      userId: uid,
      grantType: type,
      grantDate,
      totalShares,
      exercisePrice: isNaN(exercisePrice) ? 0 : exercisePrice,
      status: "active",
      symbol: "NAVR"
    };
    await addGrant(grant);
    qaGrantMsg.textContent = "Grant가 저장되었습니다.";
    await refresh(uid);
  });

  // Save Vest
  qaVestSave?.addEventListener("click", async () => {
    qaVestMsg.textContent = "";
    const vestDate = qaVestDate.value;
    const shares = parseInt(qaVestShares.value || "0", 10);
    const vested = !!qaVestVested.checked;
    if (!vestDate || !shares) {
      qaVestMsg.textContent = "필수값(날짜/주식수)을 입력하세요.";
      return;
    }
    await addVest({ userId: uid, vestDate: new Date(vestDate).toISOString(), vestedShares: shares, vested });
    qaVestMsg.textContent = "Vesting 일정이 저장되었습니다.";
    await refresh(uid);
  });

  // Simulator (간단: FMV * shares)
  simRun?.addEventListener("click", () => {
    simResult.textContent = "";
    const fmv = parseFloat(simFmv.value || "0");
    const shares = parseInt(simShares.value || "0", 10);
    if (!fmv || !shares) {
      simResult.textContent = "FMV와 주식 수를 입력하세요.";
      return;
    }
    const gross = fmv * shares;
    // 안내문구만: 세율/공제는 회사 규정 반영 필요
    simResult.innerHTML = `
      <div class="rounded-md bg-primary-light/20 p-3">
        <p><strong>총 가치(가정):</strong> ${fmt.money(gross)}</p>
        <p class="text-xs opacity-70 mt-1">※ 본 결과는 참고용입니다. 실제 원천징수는 급여정산 시 확정됩니다.</p>
      </div>
    `;
  });
});

async function refresh(uid) {
  const [grants, vests, tx] = await Promise.all([
    listUserGrants(uid),
    listUserVests(uid),
    listRecentTaxEvents(uid, 10)
  ]);

  // KPI
  const vestedShares = vests.filter(v => v.vested === true)
    .reduce((acc, v) => acc + (v.vestedShares || 0), 0);
  const totalVestedVal = vestedValue(vestedShares, 150);
  kpiVestedValue.textContent = fmt.money(totalVestedVal);
  kpiVestedDelta.textContent = grants.length ? "+5.2%" : "-";

  const upcoming = nextVesting(vests, 1);
  if (upcoming.length) {
    kpiUpcomingShares.textContent = `${fmt.int(upcoming[0].vestedShares)} Shares`;
    kpiUpcomingDate.textContent = new Date(upcoming[0].vestDate).toISOString().slice(0,10);
  } else {
    kpiUpcomingShares.textContent = "-";
    kpiUpcomingDate.textContent = "-";
  }

  const recentSum = sumRecentTx(tx);
  kpiRecentValue.textContent = tx.length ? fmt.money(recentSum) : "-";
  kpiRecentType.textContent = tx?.[0]?.type || "-";

  chartTotal.textContent = fmt.money(totalVestedVal);
  chartDelta.textContent = grants.length ? "+15.3%" : "-";

  // Render lists
  renderUpcoming(vests);
  renderTx(tx);
}

function renderUpcoming(vests) {
  const items = nextVesting(vests, 4);
  upcomingList.innerHTML = items.map(v => `
    <div class="flex items-center gap-4">
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light/30">
        <span class="material-symbols-outlined text-primary">calendar_today</span>
      </div>
      <div class="flex-1">
        <p class="font-bold">${fmt.date(v.vestDate)}</p>
        <p class="text-sm opacity-70">${fmt.int(v.vestedShares)} Shares</p>
      </div>
      <p class="font-semibold">~${fmt.money((v.vestedShares||0)*150)}</p>
    </div>
  `).join("");

  upcomingEmpty.classList.toggle("hidden", items.length > 0);
}

function renderTx(tx) {
  if (!tx.length) {
    txTbody.innerHTML = "";
    txEmpty.classList.remove("hidden");
    return;
  }
  txEmpty.classList.add("hidden");
  txTbody.innerHTML = tx.map(t => `
    <tr class="border-b border-border-light hover:bg-primary-light/10">
      <td class="p-3">${fmt.date(t.eventDate)}</td>
      <td class="p-3"><span class="rounded-full ${pillClass(t.type)} px-2 py-1 text-xs font-semibold">${t.type}</span></td>
      <td class="p-3">${fmt.int(t.shares)}</td>
      <td class="p-3 text-right font-medium">${fmt.money(t.value || 0)}</td>
    </tr>
  `).join("");
}

function pillClass(type) {
  if (type === "Sale") return "bg-red-500/20 text-red-700";
  if (type === "Vest") return "bg-green-500/20 text-green-700";
  return "bg-blue-500/20 text-blue-700";
}

// Demo data
async function seedDemo(uid) {
  const grant = {
    userId: uid, grantType: "RSU", grantDate: "2024-05-15",
    totalShares: 2000, exercisePrice: 0, status: "active", symbol: "NAVR", grantFairValue: 140
  };
  await addGrant(grant);

  const today = new Date();
  const months = [-8, -5, -2, 1, 4, 7];
  for (const m of months) {
    const d = new Date(today.getFullYear(), today.getMonth() + m, 15);
    const vested = d < today;
    await addVest({ userId: uid, vestDate: d.toISOString(), vestedShares: m % 3 === 0 ? 200 : 150, vested });
  }
  await addTaxEvent({ userId: uid, type: "Sale", eventDate: new Date().toISOString(), shares: 39, value: 5820 });
  await addTaxEvent({ userId: uid, type: "Vest", eventDate: new Date(new Date().setMonth(new Date().getMonth()-2)).toISOString(), shares: 150, value: 21750 });
}
