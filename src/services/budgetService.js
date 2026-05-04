import api from './api.js';

function pickMessage(e) {
  return e.response?.data?.message || e.message || 'Request failed';
}

export async function listBudgets() {
  const { data } = await api.get('/api/budgets');
  return data.budgets;
}

export async function getBudgetReport(month, year) {
  const { data } = await api.get('/api/budgets/report', {
    params: { month, year },
  });
  return { month: data.month, year: data.year, lines: data.lines };
}

export async function createBudget(payload) {
  try {
    const { data } = await api.post('/api/budgets', payload);
    return data.budget;
  } catch (e) {
    throw new Error(pickMessage(e));
  }
}

export async function updateBudget(id, payload) {
  try {
    const { data } = await api.put(`/api/budgets/${id}`, payload);
    return data.budget;
  } catch (e) {
    throw new Error(pickMessage(e));
  }
}

export async function deleteBudget(id) {
  const { data } = await api.delete(`/api/budgets/${id}`);
  return data;
}
