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
        <div><label>부여일</label><input id="grantDate" type="date" class="mt-2 w-full"/></div>
        <div><label>총 주식 수</label><input id="totalShares" type="number" class="mt-2 w-full"/></div>
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
  if(id){ // edit load
    const snap = await getDoc(doc(db, COL.GRANTS, id));
    if(snap.exists()){
      const g = snap.data();
      document.getElementById("grantType").value = g.grantType || "RSU";
      document.getElementById("grantDate").value = toInputDate(g.grantDate);
      document.getElementById("totalShares").value = g.totalShares || 0;
      document.getElementById("strikePrice").value = g.strikePrice || "";
      document.getElementById("expireDate").value = toInputDate(g.expireDate);
    }
  }

  document.getElementById("btn-save-grant").addEventListener("click", async()=>{
    const payload = {
      grantType: document.getElementById("grantType").value,
      grantDate: new Date(document.getElementById("grantDate").value),
      totalShares: Number(document.getElementById("totalShares").value||0),
      strikePrice: document.getElementById("strikePrice").value ? Number(document.getElementById("strikePrice").value) : null,
      expireDate: document.getElementById("expireDate").value ? new Date(document.getElementById("expireDate").value) : null,
      vestedTotal: 0,
      exercisedTotal: 0
    };
    if(id){
      await updateDoc(doc(db, COL.GRANTS, id), payload);
      toast("수정 완료"); location.hash = `#/grants/${id}`;
    }else{
      const ref = await addDoc(collection(db, COL.GRANTS), payload);
      toast("등록 완료"); location.hash = `#/grants/${ref.id}`;
    }
  });

  function toInputDate(v){
    if(!v) return "";
    const d = (typeof v?.toDate === "function") ? v.toDate() : new Date(v);
    const yyyy = d.getFullYear(), mm = String(d.getMonth()+1).padStart(2,"0"), dd=String(d.getDate()).padStart(2,"0");
    return `${yyyy}-${mm}-${dd}`;
  }
}
