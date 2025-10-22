// js/hr.js

// 베스팅 비율 계산 (근속형 균등 베스팅)
export function calcVestingRatio(grantDate, totalMonths, asOf = new Date()) {
  const start = new Date(grantDate);
  const months = (asOf.getFullYear() - start.getFullYear()) * 12 + (asOf.getMonth() - start.getMonth());
  const progressed = Math.max(0, Math.min(months + 1, totalMonths)); // 말일 처리 완화
  return totalMonths === 0 ? 1 : progressed / totalMonths;
}

// 포맷터
export const fmt = {
  int: (n) => Number(n || 0).toLocaleString('ko-KR'),
  cur: (n) => (Number(n || 0)).toLocaleString('ko-KR', { style: 'currency', currency: 'KRW' }),
  pct: (x) => `${Math.round((x || 0) * 100)}%`,
  date: (d) => new Date(d).toLocaleDateString('ko-KR'),
};

// 세금/순이익 시뮬레이션 (단순 모델, 안내용)
export function simulateOption({ fmv, strike, shares, taxRate = 0.385 }) {
  const spread = Math.max(0, fmv - strike);
  const taxable = spread * shares;
  const tax = Math.round(taxable * taxRate);
  const cashNeeded = Math.round(strike * shares);
  const net = Math.max(0, Math.round(spread * shares - tax));
  return { taxable, tax, cashNeeded, net };
}

export function simulateRSU({ fmv, shares, taxRate = 0.385 }) {
  const taxable = Math.round(fmv * shares);
  const tax = Math.round(taxable * taxRate);
  const netShares = Math.max(0, shares - Math.ceil(tax / fmv)); // 세금 차감형 가정
  return { taxable, tax, netShares };
}
