// js/views/grant_detail.js
import { db, COL } from "../firebase.js";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { fmt, simulateOption, simulateRSU } from "../hr.js";
import { toast } from "../ui.js";

export function GrantDetailView() {
  return `
  <section class="px-4 md:px-10 lg:px-40 py-6">
    <div id="grant-head" class="flex flex-wrap justify-between items-center gap-4 p-4"></div>
    <div id="grant-meta" class="p-4 grid grid-cols-1 md:grid-cols-2 gap-2"></div>

    <div class="flex flex-col gap-3 p-4">
      <div class="flex gap-6 justify-between">
        <p class="text-base font-medium">베스팅 진행률</p>
        <p id="progress-label" class="text-sm font-normal">-</p>
      </div>
      <div class="rounded bg-[#d1e6d9]">
        <div id="progress-bar" class="h-2 rounded bg-primary" style="width: 0%;"></div>
      </div>
    </div>

    <div class="px-4 py-3 @container">
      <div class="overflow-hidden rounded-lg border border-[#d1e6d9] bg-background-light">
        <table class="w-full">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left w-[30%] text-sm font-medium">베스팅 날짜</th>
              <th class="px-4 py-3 text-left w-[25%] text-sm font-medium">베스팅된 수량</th>
              <th class="px-4 py-3 text-left w-[25%] text-sm font-medium">베스팅 비율</th>
              <th class="px-4 py-3 text-left w-[20%] text-sm font-medium">상태</th>
            </tr>
          </thead>
          <tbody id="vest-tbody"></tbody>
        </table>
      </div>
    </div>

    <div class="flex flex-wrap gap-3 px-4 py-3">
      <button id="btn-sim" class="flex items-center justify-center rounded-lg h-12 px-5 bg-primary text-white text-base font-bold">
        시뮬레이터 열기
      </button>
      <button id="btn-contract" class="flex items-center justify-center rounded-lg h-12 px-5 bg-primary/20 text-ink text-base font-bold">
        부여 계약서 다운로드
      </button>
      <a href="#/grants" class="ml-auto flex items-center justify-center rounded-lg h-12 px-5 bg-primary/20 text-ink text-base font-bold">
        뒤로
      </a>
    </div>

    <!-- 시뮬레이터 모달 -->
    <dialog id="sim-modal" class="rounded-xl p-0 w-[520px] max-w-[95vw]">
      <form method="dialog" class="p-5">
        <h3 class="text-lg font-black mb-3">시뮬레이터</h3>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm font-bold">현재가(가정)</label>
            <input id="sim-fmv" type="number" step="0.01" class="mt-1 w-full" placeholder="예: 25000"/>
          </div>
          <div>
            <label class="text-sm font-bold">행사가(옵션)</label>
            <input id="sim-strike" type="number" step="0.01" class="mt-1 w-full" placeholder="예: 15000"/>
          </div>
          <div>
            <label class="text-sm font-bold">수량</label>
            <input id="sim-shares" type="number" class="mt-1 w-full" placeholder="예: 1000"/>
          </div>
          <div>
            <label class="text-sm font-bold">세율(소득+지방)</label>
            <input id="sim-tax" type="number" step="0.001" class="mt-1 w-full" placeholder="0.385"/>
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button id="sim-run-option" class="px-4 py-2 bg-primary text-white rounded">옵션 계산</button>
          <button id="sim-run-rsu" class="px-4 py-2 bg-primary/20 text-ink rounded">RSU 계산</button>
          <button class="ml-auto px-4 py-2 bg-[#eaeaea] rounded">닫기</button>
        </div>

        <div id="sim-out" class="mt-4 p-3 bg-[#f6f9f7] rounded text-sm"></div>
        <p class="mt-2 text-[12px] text-[#51946c]">※ 안내용 시뮬레이션 결과이며 실제 원천징수액은 급여정산 시 확정됩니다.</p>
      </form>
    </dialog>
  </section>`;
}

export async function bindGrantDetail(user, grantId) {
  const ref = doc(db, COL.GRANTS, grantId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    document.getElementById("app").innerHTML = `<section class="p-10 text-[#51946c]">존재하지 않는 부여입니다.</section>`;
    return;
  }
  const g = { id: snap.id, ...snap.data() };

  // 헤더
  document.getElementById("grant-head").innerHTML = `
    <div class="flex flex-col gap-1">
      <p class="text-4xl font-black">부여 세부 정보: ${g.id}</p>
      <p class="text-[#51946c] text-base">초기 주식 부여 - ${new Date(g.grantDate?.toDate?.() || g.grantDate).getFullYear()}</p>
    </div>`;

  // 메타
  document.getElementById("grant-meta").innerHTML = `
    ${Meta("부여일", g.grantDate)}
    ${Meta("부여 유형", g.grantType)}
    ${Meta("주식 수량", fmt.int(g.totalShares))}
    ${Meta("행사 가격", g.strikePrice ? fmt.cur(g.strikePrice) : "-")}
    ${Meta("만료일", g.expireDate)}
  `;

  // 진행률
  const pct = Math.round(((g.vestedTotal || 0) / (g.totalShares || 1)) * 100);
  document.getElementById("progress-label").textContent = pct + "%";
  document.getElementById("progress-bar").style.width = pct + "%";

  // 베스팅 테이블
  const vq = query(
    collection(db, COL.VESTS),
    where("grantId", "==", g.id),
    orderBy("vestDate", "asc")
  );
  const vsnap = await getDocs(vq);
  const rows = [];
  vsnap.forEach(doc => {
    const v = { id: doc.id, ...doc.data() };
    rows.push(`
      <tr class="border-t border-[#d1e6d9]">
        <td class="px-4 py-2 text-[#51946c] text-sm">${fmt.date(v.vestDate?.toDate?.() || v.vestDate)}</td>
        <td class="px-4 py-2 text-[#51946c] text-sm">${fmt.int(v.vestedShares)}</td>
        <td class="px-4 py-2 text-[#51946c] text-sm">${Math.round((v.ratio || 0)*100)}%</td>
        <td class="px-4 py-2 text-sm">
          <span class="badge ${v.vested ? 'badge-soft' : ''}">${v.vested ? '베스팅 완료' : '예정'}</span>
        </td>
      </tr>
    `);
  });
  document.getElementById("vest-tbody").innerHTML = rows.join("");

  // 버튼/모달
  const dlg = document.getElementById("sim-modal");
  document.getElementById("btn-sim").addEventListener("click", () => dlg.showModal());
  document.getElementById("sim-run-option").addEventListener("click", (e) => {
    e.preventDefault();
    const { fmv, strike, shares, tax } = readSim();
    const r = simulateOption({ fmv, strike, shares, taxRate: tax });
    present(`옵션 시뮬레이션`,
      `과세표준: ${fmt.cur(r.taxable)}<br/>원천징수 추정: ${fmt.cur(r.tax)}<br/>행사비용(현금): ${fmt.cur(r.cashNeeded)}<br/>순이익: ${fmt.cur(r.net)}`);
  });
  document.getElementById("sim-run-rsu").addEventListener("click", (e) => {
    e.preventDefault();
    const { fmv, shares, tax } = readSim();
    const r = simulateRSU({ fmv, shares, taxRate: tax });
    present(`RSU 시뮬레이션`,
      `과세표준: ${fmt.cur(r.taxable)}<br/>원천징수 추정: ${fmt.cur(r.tax)}<br/>실수령 주식(추정): ${fmt.int(r.netShares)} 주`);
  });
  document.getElementById("btn-contract").addEventListener("click", () => {
    toast("샘플: 계약서 파일 연동 필요");
  });

  function readSim() {
    const fmv = Number(document.getElementById("sim-fmv").value || 0);
    const strike = Number(document.getElementById("sim-strike").value || 0);
    const shares = Number(document.getElementById("sim-shares").value || 0);
    const tax = Number(document.getElementById("sim-tax").value || 0.385);
    return { fmv, strike, shares, tax };
  }
  function present(title, html) {
    document.getElementById("sim-out").innerHTML = `<p class="font-bold mb-1">${title}</p><div>${html}</div>`;
  }
}

function Meta(label, value) {
  const toKoreanDate = (v) => {
    // Firestore Timestamp 객체인 경우
    if (v && typeof v.toDate === "function") {
      return v.toDate().toLocaleDateString("ko-KR");
    }
    // 숫자/문자열/Date를 날짜로 파싱
    if (v) {
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d.toLocaleDateString("ko-KR");
      return String(v); // 날짜 아님 → 그대로 표시
    }
    return "-";
  };

  const text = toKoreanDate(value);

  return `
  <div class="flex flex-col gap-1 border-t border-[#d1e6d9] py-4">
    <p class="text-[#51946c] text-sm">${label}</p>
    <p class="text-sm">${text}</p>
  </div>`;
}
