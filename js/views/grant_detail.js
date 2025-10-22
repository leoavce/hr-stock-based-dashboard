// js/views/grant_detail.js
import { db, COL } from "../firebase.js";
import { doc, getDoc, collection, query, where, getDocs, orderBy, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { fmt } from "../hr.js";
import { toast } from "../ui.js";

export function GrantDetailView(){
  return `
  <section class="max-w-[1000px] mx-auto px-5 md:px-10 py-8">
    <div id="head" class="flex items-center justify-between mb-4"></div>
    <div id="meta" class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6"></div>

    <div class="hr-card p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex gap-4 items-center">
          <span class="text-lg font-extrabold">베스팅 진행률</span>
          <span id="progress-label" class="badge badge-soft">-</span>
        </div>
        <div class="flex gap-2">
          <a id="btn-edit-grant" class="btn btn-soft" href="#">부여 수정</a>
          <button id="btn-delete-grant" class="btn btn-danger">부여 삭제</button>
        </div>
      </div>
      <div class="h-3 rounded bg-primary-soft overflow-hidden">
        <div id="progress-bar" class="h-3 bg-primary" style="width:0%"></div>
      </div>
    </div>

    <div class="hr-card p-5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xl font-extrabold">베스팅 스케줄</h3>
        <button id="btn-add-vest" class="btn btn-primary">추가</button>
      </div>
      <table class="w-full">
        <thead>
          <tr>
            <th class="px-3 py-3 text-left text-sm font-extrabold">베스팅 날짜</th>
            <th class="px-3 py-3 text-left text-sm font-extrabold">수량</th>
            <th class="px-3 py-3 text-left text-sm font-extrabold">비율</th>
            <th class="px-3 py-3 text-left text-sm font-extrabold">상태</th>
            <th class="px-3 py-3 text-right text-sm font-extrabold">관리</th>
          </tr>
        </thead>
        <tbody id="vest-tbody"></tbody>
      </table>
    </div>

    <dialog id="dlg-vest" class="rounded-xl p-0 w-[520px] max-w-[95vw]">
      <form method="dialog" class="p-5">
        <h3 id="dlg-title" class="text-lg font-extrabold mb-3">베스팅 추가</h3>
        <input type="hidden" id="vest-id"/>
        <div class="grid grid-cols-2 gap-3">
          <div><label>베스팅 날짜</label><input id="vest-date" type="date" class="mt-2 w-full"/></div>
          <div><label>수량</label><input id="vest-shares" type="number" class="mt-2 w-full"/></div>
          <div><label>비율(0~1)</label><input id="vest-ratio" type="number" step="0.001" class="mt-2 w-full"/></div>
          <div><label>완료여부</label>
            <select id="vest-flag" class="mt-2 w-full">
              <option value="false">예정</option>
              <option value="true">완료</option>
            </select>
          </div>
        </div>
        <div class="flex gap-2 mt-5">
          <button id="btn-save-vest" class="btn btn-primary">저장</button>
          <button class="ml-auto btn">닫기</button>
        </div>
      </form>
    </dialog>
  </section>`;
}

export async function bindGrantDetail(grantId){
  if(!grantId){
    document.getElementById("app").innerHTML = `<section class="p-10 text-muted">잘못된 접근입니다. 부여 ID가 없습니다. <a class="btn btn-soft ml-2" href="#/grants">목록</a></section>`;
    return;
  }

  const gref = doc(db, COL.GRANTS, grantId);
  const gsnap = await getDoc(gref);
  if(!gsnap.exists()){
    document.getElementById("app").innerHTML = `<section class="p-10 text-muted">존재하지 않는 부여입니다. <a class="btn btn-soft ml-2" href="#/grants">목록</a></section>`;
    return;
  }
  const g = { id:gsnap.id, ...gsnap.data() };

  // 직원 조회
  let empTxt = "-";
  if(g.employeeId){
    const es = await getDoc(doc(db, COL.EMP, g.employeeId)).catch(()=>null);
    const e = es?.data();
    if(e){ empTxt = `${e.name||"-"} (${e.empNo||"-"})`; }
  }

  // 헤더/메타
  document.getElementById("head").innerHTML = `
    <div>
      <h2 class="text-3xl font-extrabold">부여 세부 정보: ${g.id}</h2>
      <p class="text-muted mt-1">${g.grantType||"-"} — ${fmt.date(g.grantDate)} — ${empTxt}</p>
    </div>
    <a href="#/grants" class="btn btn-soft">뒤로</a>
  `;
  document.getElementById("meta").innerHTML = `
    ${Meta("직원", empTxt)}
    ${Meta("부여 유형", g.grantType)}
    ${Meta("부여일", g.grantDate)}
    ${Meta("총 주식", g.totalShares)}
    ${Meta("행사가격", g.strikePrice ? g.strikePrice : "-")}
    ${Meta("만료일", g.expireDate)}
  `;

  const pct = Math.round(((g.vestedTotal||0)/(g.totalShares||1))*100);
  document.getElementById("progress-label").textContent = pct+"%";
  document.getElementById("progress-bar").style.width = pct+"%";

  await loadVests(g.id);

  document.getElementById("btn-edit-grant").addEventListener("click", (e)=>{
    e.preventDefault(); location.hash = `#/admin/new-grant?id=${g.id}`;
  });
  document.getElementById("btn-delete-grant").addEventListener("click", async()=>{
    if(confirm("이 부여를 삭제하시겠습니까? (스케줄도 함께 삭제됩니다)")){
      const vq = query(collection(db, COL.VESTS), where("grantId","==", g.id));
      const vs = await getDocs(vq);
      await Promise.all(vs.docs.map(d=>deleteDoc(d.ref)));
      await deleteDoc(gref);
      toast("삭제 완료"); location.hash = "#/grants";
    }
  });

  const dlg = document.getElementById("dlg-vest");
  document.getElementById("btn-add-vest").addEventListener("click", ()=> openVestDialog({ grantId: g.id }));
  document.getElementById("btn-save-vest").addEventListener("click", async (e)=>{
    e.preventDefault();
    const id = document.getElementById("vest-id").value;
    const payload = {
      grantId: g.id,
      vestDate: new Date(document.getElementById("vest-date").value),
      vestedShares: Number(document.getElementById("vest-shares").value || 0),
      ratio: Number(document.getElementById("vest-ratio").value || 0),
      vested: document.getElementById("vest-flag").value === "true"
    };
    if(isNaN(payload.vestDate)) return toast("베스팅 날짜를 입력하세요.");

    if(id){ await updateDoc(doc(db, COL.VESTS, id), payload); toast("수정 완료"); }
    else { await addDoc(collection(db, COL.VESTS), payload); toast("추가 완료"); }

    dlg.close(); await loadVests(g.id);
  });

  async function loadVests(grantId){
    const vq = query(collection(db, COL.VESTS), where("grantId","==", grantId), orderBy("vestDate","asc"));
    const vsnap = await getDocs(vq);
    const rows = [];
    vsnap.forEach(d=>{
      const v = { id:d.id, ...d.data() };
      rows.push(`
        <tr class="table-row">
          <td class="px-3 py-2 text-sm">${fmt.date(v.vestDate)}</td>
          <td class="px-3 py-2 text-sm">${v.vestedShares?.toLocaleString?.("ko-KR")||0}</td>
          <td class="px-3 py-2 text-sm">${Math.round((v.ratio||0)*100)}%</td>
          <td class="px-3 py-2 text-sm">${v.vested ? '<span class="badge badge-soft">완료</span>' : '예정'}</td>
          <td class="px-3 py-2 text-right">
            <button class="btn btn-soft" data-edit="${v.id}">수정</button>
            <button class="btn btn-danger" data-del="${v.id}">삭제</button>
          </td>
        </tr>`);
    });
    document.getElementById("vest-tbody").innerHTML = rows.join("") || `<tr><td class="px-3 py-4 text-sm text-muted" colspan="5">스케줄 없음</td></tr>`;

    document.querySelectorAll("[data-edit]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = btn.getAttribute("data-edit");
        const v = vsnap.docs.find(x=>x.id===id).data();
        openVestDialog({ id, ...v });
      });
    });
    document.querySelectorAll("[data-del]").forEach(btn=>{
      btn.addEventListener("click", async ()=>{
        const id = btn.getAttribute("data-del");
        if(confirm("삭제하시겠습니까?")){
          await deleteDoc(doc(db, COL.VESTS, id));
          toast("삭제 완료"); await loadVests(grantId);
        }
      });
    });
  }

  function openVestDialog(v={}){
    document.getElementById("dlg-title").textContent = v.id ? "베스팅 수정" : "베스팅 추가";
    document.getElementById("vest-id").value = v.id || "";
    document.getElementById("vest-date").value = v.vestDate ? toInputDate(v.vestDate) : "";
    document.getElementById("vest-shares").value = v.vestedShares || "";
    document.getElementById("vest-ratio").value = v.ratio || "";
    document.getElementById("vest-flag").value = String(!!v.vested);
    document.getElementById("dlg-vest").showModal();
  }
  function toInputDate(v){
    const d = (typeof v?.toDate === "function") ? v.toDate() : new Date(v);
    const yyyy = d.getFullYear(), mm = String(d.getMonth()+1).padStart(2,"0"), dd = String(d.getDate()).padStart(2,"0");
    return `${yyyy}-${mm}-${dd}`;
  }
}

function Meta(label, value){
  let text = "-";
  if (label === "총 주식") text = (value||0).toLocaleString("ko-KR");
  else if (value && typeof value?.toDate === "function") text = value.toDate().toLocaleDateString("ko-KR");
  else if (value instanceof Date || typeof value === "string") {
    const d = new Date(value); text = isNaN(d) ? String(value) : d.toLocaleDateString("ko-KR");
  } else if (value != null) text = String(value);

  return `
  <div class="flex flex-col gap-1 border-t border-[var(--border)] py-4">
    <p class="text-muted text-sm">${label}</p>
    <p class="text-base">${text}</p>
  </div>`;
}
