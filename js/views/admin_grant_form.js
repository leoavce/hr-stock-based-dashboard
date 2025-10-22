// js/views/admin_grant_form.js
import { db, COL } from "../firebase.js";
import { addDoc, collection, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
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
        <div><label>부여 유형</label>
          <select id="grantType" class="mt-2 w-full">
            <option value="RSU">RSU</option>
            <option value="OPTION">OPTION</option>
          </select>
        </div>
        <div><label>부여일 <span class="text-red-600">*</span></label><input id="grantDate" type="date" class="mt-2 w-full" required/></div>
        <div><label>총 주식 수 <span class="text-red-600">*</span></label><input id="totalShares" type="number" class="mt-2 w-full" min="1" required/></div>
        <div><label>행사가격(옵션)</label><input id="strikePrice" type="number" step="0.01" class="mt-2 w-full" placeholder="옵션만"/></div>
        <div><label>만료일(옵션)</label><input id="expireDate" type="date" class="mt-2 w-full"/></div>
      </div>
      <div class="flex gap-2 mt-6">
        <button id="btn-save-grant" class="btn btn-primary">${id? "수정":"등록"}</button>
        <a href="#/grants" class="btn">취소</a>
      </div>
      <input type="hidden" id="grantId" value="${id}"/>
    </div>
  </section>`;
}

export async function bindGrantForm(){
  const id = document.getElementById("grantId").value;
  if(id){
    const snap = await getDoc(doc(db, COL.GRANTS, id));
    if(snap.exists()){
      const g = snap.data();
      document.getElementById("grantType").value = g.grantType || "RSU";
      document.getElementById("grantDate").value = toInputDate(g.grantDate);
      document.getElementById("totalShares").value = g.totalShares || 0;
      document.getElementById("strikePrice").value = g.strikePrice ?? "";
      document.getElementById("expireDate").value = toInputDate(g.expireDate);
    }
  }

  document.getElementById("btn-save-grant").addEventListener("click", async()=>{
    const grantType = document.getElementById("grantType").value;
    const grantDateStr = document.getElementById("grantDate").value;
    const totalShares = Number(document.getElementById("totalShares").value || 0);
    const strikePriceStr = document.getElementById("strikePrice").value;
    const expireDateStr = document.getElementById("expireDate").value;

    // ✅ 필수값 검사 + 날짜 유효성 체크
    if(!grantDateStr){ return toast("부여일은 필수입니다."); }
    const grantDate = parseInputDate(grantDateStr);
    if(!grantDate){ return toast("부여일 형식이 올바르지 않습니다."); }
    if(!totalShares || totalShares < 1){ return toast("총 주식 수를 1 이상으로 입력하세요."); }

    const strikePrice = strikePriceStr ? Number(strikePriceStr) : null;
    const expireDate = expireDateStr ? parseInputDate(expireDateStr) : null;
    if(expireDateStr && !expireDate){ return toast("만료일 형식이 올바르지 않습니다."); }

    const payload = {
      grantType,
      grantDate,           // ✔ 유효한 Date 객체
      totalShares,
      strikePrice,
      expireDate,
      vestedTotal: 0,
      exercisedTotal: 0
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
  function parseInputDate(str){
    // HTML date input은 'YYYY-MM-DD'
    const d = new Date(str+"T00:00:00");
    return isNaN(d) ? null : d;
  }
}
