// js/views/admin_grant_form.js
import { db, COL } from "../firebase.js";
import { addDoc, collection, doc, getDoc, getDocs, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { toast } from "../ui.js";

export function GrantFormView(){
  const url = new URL(location.href);
  const id = url.searchParams.get("id") || "";
  return `
  <section class="max-w-[860px] mx-auto px-5 md:px-10 py-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl md:text-4xl font-extrabold">${id? "부여 수정":"부여 등록"}</h2>
      <a href="#/grants" class="btn btn-soft">목록</a>
    </div>
    <div class="hr-card p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div class="md:col-span-2">
          <label>직원 선택 *</label>
          <div class="mt-2 flex gap-2">
            <input id="emp-search" class="flex-1" placeholder="이름/사번/이메일로 검색"/>
            <button id="btn-new-emp" class="btn btn-soft" type="button">새 직원</button>
          </div>
          <div id="emp-results" class="mt-2 max-h-48 overflow-auto border border-[var(--border)] rounded-lg hidden"></div>
          <input type="hidden" id="employeeId"/>
          <p id="emp-picked" class="mt-2 text-sm text-muted"></p>
        </div>

        <div><label>부여 유형</label>
          <select id="grantType" class="mt-2 w-full">
            <option value="RSU">RSU</option>
            <option value="OPTION">OPTION</option>
          </select>
        </div>
        <div><label>부여일 *</label><input id="grantDate" type="date" class="mt-2 w-full" required/></div>
        <div><label>총 주식 수 *</label><input id="totalShares" type="number" class="mt-2 w-full" min="1" required/></div>
        <div><label>행사가격(옵션)</label><input id="strikePrice" type="number" step="0.01" class="mt-2 w-full" placeholder="옵션만"/></div>
        <div><label>만료일(옵션)</label><input id="expireDate" type="date" class="mt-2 w-full"/></div>
      </div>

      <div class="flex gap-2 mt-6">
        <button id="btn-save-grant" class="btn btn-primary">${id? "수정":"등록"}</button>
        <a href="#/grants" class="btn">취소</a>
      </div>
      <input type="hidden" id="grantId" value="${id}"/>
    </div>

    <!-- 새 직원 다이얼로그 -->
    <dialog id="dlg-new-emp" class="rounded-xl p-0 w-[520px] max-w-[95vw]">
      <form method="dialog" class="p-5">
        <h3 class="text-lg font-extrabold mb-3">새 직원 등록</h3>
        <div class="grid grid-cols-2 gap-3">
          <div><label>이름 *</label><input id="ne-name" class="mt-2 w-full"/></div>
          <div><label>사번 *</label><input id="ne-empno" class="mt-2 w-full"/></div>
          <div><label>이메일</label><input id="ne-email" type="email" class="mt-2 w-full"/></div>
          <div><label>부서</label><input id="ne-dept" class="mt-2 w-full"/></div>
        </div>
        <div class="flex gap-2 mt-4">
          <button id="ne-save" class="btn btn-primary">저장</button>
          <button class="ml-auto btn">닫기</button>
        </div>
      </form>
    </dialog>
  </section>`;
}

export async function bindGrantForm(){
  // 직원 검색 인덱스 로드(간단: 전체를 가져와서 클라이언트 검색)
  const allEmpSnap = await getDocs(query(collection(db, COL.EMP), orderBy("name","asc")));
  const EMP = allEmpSnap.docs.map(d=>({ id:d.id, ...d.data() }));

  const id = document.getElementById("grantId").value;
  const empField = document.getElementById("employeeId");
  const empPicked = document.getElementById("emp-picked");
  const resultBox = document.getElementById("emp-results");
  const searchInput = document.getElementById("emp-search");

  // 직원 검색
  searchInput.addEventListener("input", ()=>{
    const q = searchInput.value.trim().toLowerCase();
    if(!q){ resultBox.classList.add("hidden"); resultBox.innerHTML=""; return; }
    const hits = EMP.filter(e =>
      (e.name||"").toLowerCase().includes(q) ||
      (e.empNo||"").toLowerCase().includes(q) ||
      (e.email||"").toLowerCase().includes(q)
    ).slice(0,30);
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = hits.length ? hits.map(e=>`
      <button class="w-full text-left px-3 py-2 hover:bg-[var(--primary-soft)]" data-pick="${e.id}">
        ${e.name||"-"} · ${e.empNo||"-"} · ${e.email||""}
      </button>`).join("") : `<div class="px-3 py-2 text-sm text-muted">검색 결과 없음</div>`;
    resultBox.querySelectorAll("[data-pick]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const eid = btn.getAttribute("data-pick");
        const e = EMP.find(x=>x.id===eid);
        empField.value = e.id;
        empPicked.textContent = `선택됨: ${e.name} (${e.empNo})`;
        resultBox.classList.add("hidden");
      });
    });
  });

  // 새 직원 등록
  const dlg = document.getElementById("dlg-new-emp");
  document.getElementById("btn-new-emp").addEventListener("click", ()=> dlg.showModal());
  document.getElementById("ne-save").addEventListener("click", async (e)=>{
    e.preventDefault();
    const name = document.getElementById("ne-name").value?.trim();
    const empNo = document.getElementById("ne-empno").value?.trim();
    const email = document.getElementById("ne-email").value?.trim() || null;
    const dept = document.getElementById("ne-dept").value?.trim() || null;
    if(!name || !empNo) return toast("이름/사번은 필수입니다.");
    const ref = await addDoc(collection(db, COL.EMP), { name, empNo, email, dept, status:"ACTIVE" });
    EMP.push({ id: ref.id, name, empNo, email, dept, status:"ACTIVE" });
    empField.value = ref.id;
    empPicked.textContent = `선택됨: ${name} (${empNo})`;
    dlg.close();
    toast("직원 등록/선택 완료");
  });

  // 수정모드: 기존 값 로드
  if(id){
    const snap = await getDoc(doc(db, COL.GRANTS, id));
    if(snap.exists()){
      const g = snap.data();
      document.getElementById("grantType").value = g.grantType || "RSU";
      document.getElementById("grantDate").value = toInputDate(g.grantDate);
      document.getElementById("totalShares").value = g.totalShares || 0;
      document.getElementById("strikePrice").value = g.strikePrice ?? "";
      document.getElementById("expireDate").value = toInputDate(g.expireDate);
      if(g.employeeId){
        empField.value = g.employeeId;
        const em = EMP.find(x=>x.id===g.employeeId);
        if(em){ empPicked.textContent = `선택됨: ${em.name} (${em.empNo})`; }
      }
    }
  }

  document.getElementById("btn-save-grant").addEventListener("click", async()=>{
    const employeeId = empField.value;
    if(!employeeId) return toast("직원을 선택해주세요.");

    const grantType = document.getElementById("grantType").value;
    const grantDateStr = document.getElementById("grantDate").value;
    const totalShares = Number(document.getElementById("totalShares").value || 0);
    const strikePriceStr = document.getElementById("strikePrice").value;
    const expireDateStr = document.getElementById("expireDate").value;

    if(!grantDateStr) return toast("부여일은 필수입니다.");
    const grantDate = parseInputDate(grantDateStr);
    if(!grantDate) return toast("부여일 형식이 올바르지 않습니다.");
    if(!totalShares || totalShares < 1) return toast("총 주식 수를 1 이상으로 입력하세요.");

    const strikePrice = strikePriceStr ? Number(strikePriceStr) : null;
    const expireDate = expireDateStr ? parseInputDate(expireDateStr) : null;
    if(expireDateStr && !expireDate) return toast("만료일 형식이 올바르지 않습니다.");

    const payload = {
      employeeId, grantType, grantDate, totalShares, strikePrice, expireDate,
      vestedTotal: 0, exercisedTotal: 0
    };

    try{
      if(id){
        await updateDoc(doc(db, COL.GRANTS, id), payload);
        toast("수정 완료"); location.hash = `#/grants/${id}`;
      }else{
        const ref = await addDoc(collection(db, COL.GRANTS), payload);
        toast("등록 완료"); location.hash = `#/grants/${ref.id}`;
      }
    }catch(e){
      console.error(e);
      toast("저장 실패: " + (e.code || e.message));
    }
  });

  function toInputDate(v){
    if(!v) return "";
    const d = (typeof v?.toDate === "function") ? v.toDate() : new Date(v);
    if(isNaN(d)) return "";
    const yyyy = d.getFullYear(), mm = String(d.getMonth()+1).padStart(2,"0"), dd = String(d.getDate()).padStart(2,"0");
    return `${yyyy}-${mm}-${dd}`;
  }
  function parseInputDate(str){ const d = new Date(str+"T00:00:00"); return isNaN(d)? null : d; }
}
