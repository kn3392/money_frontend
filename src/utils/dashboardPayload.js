const TOL = 0.02;

function sumField(rows, field) {
  return (
    Math.round(rows.reduce((s, r) => s + Number(r[field] ?? 0), 0) * 100) / 100
  );
}

/**
 * Older or partial APIs may omit `cashFlow` or send zeros while `summary` and
 * `totalAvailableBalance` are correct. Rebuild portfolio cash-flow totals from
 * per-account rows so closing matches available balance.
 */
export function enrichDashboardCashFlow(payload) {
  if (!payload || !Array.isArray(payload.summary) || payload.summary.length === 0) {
    return payload;
  }
  const rows = payload.summary;
  const rowClosing = sumField(rows, 'currentBalance');
  const rawAvail = payload.totalAvailableBalance;
  const avail = Number(rawAvail);
  const useAvail = Number.isFinite(avail) ? avail : rowClosing;

  const cf = payload.cashFlow;
  const cfClosing =
    cf != null && cf.closingBalanceTotal != null
      ? Number(cf.closingBalanceTotal)
      : NaN;
  const closingOk =
    Number.isFinite(cfClosing) && Math.abs(cfClosing - useAvail) <= TOL;

  if (cf && closingOk) {
    return payload;
  }

  const openingBalanceTotal = sumField(rows, 'openingBalance');
  const totalIncome = sumField(rows, 'totalIncome');
  const totalExpense = sumField(rows, 'totalExpense');
  const netSavings = Math.round((totalIncome - totalExpense) * 100) / 100;
  const closingBalanceTotal = Math.round(rowClosing * 100) / 100;

  return {
    ...payload,
    cashFlow: {
      openingBalanceTotal,
      totalIncome,
      totalExpense,
      netSavings,
      closingBalanceTotal,
    },
  };
}
