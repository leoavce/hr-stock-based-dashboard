// js/views/admin_csv.js
import { db, COL } from "../firebase.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { toast } from "../ui.js";

export function CsvView(){
  return `
  <section class="max-w-[900px] mx-auto px-5 md:px-10 py-8">
    <div class="mb-6">
      <h2 class="text-3xl md:text-4xl font-extrabold">CSV 업로드</h2>
      <p class="text-muted mt-1">부여/베스팅 데이터를 일괄 등록합니다.</p>
    </div>

    <div class="hr-card p-6 mb-6">
      <h3 class="text-xl font-extrabold mb-3">부여(Grants) 업로드</h3>
      <p class="text-sm text-muted mb-2">헤더: <code>grantType, grantDate(YYYY-MM-DD), totalShares, strikePrice?, expireDate?</code></p>
      <input id="csv-grants" type="file" accept=".csv" class="mb-3"/>
      <button id="btn-upload-grants" class="btn btn-primary">업로드</button>
    </div>

    <div class="hr-card p-6">
      <h3 class="text-xl font-extrabold mb-3">베스팅(Vests) 업로드</h3>
      <p class="text-sm text-muted mb-2">헤더: <code>grantId, vestDate(YYYY-MM-DD), vestedShares, ratio(0~1), vested(true/false)</code></p>
      <input id="csv-vests" type="file" accept=".csv" class="mb-3"/>
      <button id="btn-upload-vests" class="btn btn-primary">업로드</button>
    </div>
  </section>`;
}

export function bindCsv(){
  document.getElementById("btn-upload-grants").addEventListener("click", async()=>{
    const file = document.getElementById("csv-grants").files?.[0];
    if(!file) return toast("CSV 파일을 선택하세요");
    const rows = await readCsv(file);
    let ok=0, skip=0;
    for(const r of rows){
      if(!r.grantType || !r.grantDate || !r.totalShares){ skip++; continue; }
      const grantDate = parseDate(r.grantDate);
      if(!grantDate){ skip++; continue; }
      const expireDate = r.expireDate ? parseDate(r.expireDate) : null;
      if(r.expireDate && !expireDate){ skip++; continue; }

      await addDoc(collection(db, COL.GRANTS), {
        grantType: r.grantType.trim(),
        grantDate,
        totalShares: Number(r.totalShares),
        strikePrice: r.strikePrice? Number(r.strikePrice): null,
        expireDate,
        vestedTotal: 0, exercisedTotal: 0
      });
      ok++;
    }
    toast(`부여 업로드 완료: ${ok}건 / 실패(건너뜀): ${skip}건`);
  });

  document.getElementById("btn-upload-vests").addEventListener("click", async()=>{
    const file = document.getElementById("csv-vests").files?.[0];
    if(!file) return toast("CSV 파일을 선택하세요");
    const rows = await readCsv(file);
    let ok=0, skip=0;
    for(const r of rows){
      if(!r.grantId || !r.vestDate || !r.vestedShares){ skip++; continue; }
      const vestDate = parseDate(r.vestDate);
      if(!vestDate){ skip++; continue; }

      await addDoc(collection(db, COL.VESTS), {
        grantId: r.grantId.trim(),
        vestDate,
        vestedShares: Number(r.vestedShares),
        ratio: r.ratio? Number(r.ratio): 0,
        vested: String(r.vested).toLowerCase()==="true"
      });
      ok++;
    }
    toast(`베스팅 업로드 완료: ${ok}건 / 실패(건너뜀): ${skip}건`);
  });
}

async function readCsv(file){
  const text = await file.text();
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  if(lines.length<2) return [];
  const headers = lines[0].split(",").map(h=>h.trim());
  const out = [];
  for(let i=1;i<lines.length;i++){
    const cols = splitCsvLine(lines[i]);
    const row = {};
    headers.forEach((h,idx)=> row[h] = (cols[idx]??"").trim());
    out.push(row);
  }
  return out;
}

function splitCsvLine(line){
  const res=[], len=line.length;
  let cur="", inq=false;
  for(let i=0;i<len;i++){
    const ch=line[i];
    if(ch === '"'){
      if(inq && line[i+1]==='"'){ cur+='"'; i++; }
      else inq = !inq;
    }else if(ch === ',' && !inq){
      res.push(cur); cur="";
    }else{
      cur+=ch;
    }
  }
  res.push(cur);
  return res;
}

function parseDate(s){
  // 기대 포맷: YYYY-MM-DD
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s+"T00:00:00");
  return isNaN(d) ? null : d;
}
