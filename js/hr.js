// js/hr.js
export const fmt = {
  int: n => Number(n||0).toLocaleString("ko-KR"),
  cur: n => Number(n||0).toLocaleString("ko-KR", {style:"currency", currency:"KRW"}),
  date: d => {
    if (!d) return "-";
    if (typeof d?.toDate === "function") return d.toDate().toLocaleDateString("ko-KR");
    const dt = new Date(d); return isNaN(dt) ? String(d) : dt.toLocaleDateString("ko-KR");
  }
};

export function simulateOption({fmv, strike, shares, taxRate=0.385}){
  const spread = Math.max(0, fmv - strike);
  const taxable = spread * shares;
  const tax = Math.round(taxable * taxRate);
  const cashNeeded = Math.round(strike * shares);
  const net = Math.max(0, Math.round(spread * shares - tax));
  return { taxable, tax, cashNeeded, net };
}

export function simulateRSU({fmv, shares, taxRate=0.385}){
  const taxable = Math.round(fmv * shares);
  const tax = Math.round(taxable * taxRate);
  const netShares = Math.max(0, shares - Math.ceil(tax / (fmv||1)));
  return { taxable, tax, netShares };
}
