// js/utils.js
export const fmt = {
  money(n) { return n == null ? "-" : n.toLocaleString(undefined, { style: "currency", currency: "USD" }); },
  int(n) { return n == null ? "-" : new Intl.NumberFormat().format(n); },
  date(d) {
    const dt = new Date(d);
    return isNaN(+dt) ? "-" : dt.toLocaleDateString();
  }
};

// 단순 베스팅 가치: shares * price
export function vestedValue(vestedShares, fmv = 150) {
  return vestedShares * fmv;
}

// 다음 베스팅 N개 추출
export function nextVesting(vests, count = 4) {
  const now = new Date();
  const upcoming = vests
    .filter(v => new Date(v.vestDate) >= now)
    .sort((a, b) => +new Date(a.vestDate) - +new Date(b.vestDate));
  return upcoming.slice(0, count);
}

// 최근 거래 합계
export function sumRecentTx(tx) {
  if (!tx?.length) return 0;
  return tx.reduce((acc, t) => acc + (t.value || 0), 0);
}
