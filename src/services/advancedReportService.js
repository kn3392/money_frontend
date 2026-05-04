import api from './api.js';

export async function budgetVsActual(params) {
  const { data } = await api.get('/api/advanced-reports/budget-vs-actual', { params });
  return data.data;
}

export async function savingsGoalsReport() {
  const { data } = await api.get('/api/advanced-reports/savings-goals');
  return data.data;
}

export async function cashFlow(params) {
  const { data } = await api.get('/api/advanced-reports/cash-flow', { params });
  return data.data;
}

export async function dailyTrend(params) {
  const { data } = await api.get('/api/advanced-reports/daily-trend', { params });
  return data.data;
}

export async function personSettlement() {
  const { data } = await api.get('/api/advanced-reports/person-settlement');
  return data.data;
}

export async function accountMovement(params) {
  const { data } = await api.get('/api/advanced-reports/account-movement', { params });
  return data.data;
}

export async function categoryComparison() {
  const { data } = await api.get('/api/advanced-reports/category-comparison');
  return data.data;
}

export async function financialYearTaxSummary(financialYear) {
  const { data } = await api.get('/api/advanced-reports/financial-year-tax-summary', {
    params: { financialYear },
  });
  return data.data;
}

export async function topExpenses(params) {
  const { data } = await api.get('/api/advanced-reports/top-expenses', { params });
  return data.data;
}

export async function noEntryDays(params) {
  const { data } = await api.get('/api/advanced-reports/no-entry-days', { params });
  return data.data;
}
