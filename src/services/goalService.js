import api from './api.js';

function pickMessage(e) {
  return e.response?.data?.message || e.message || 'Request failed';
}

export async function listGoals() {
  const { data } = await api.get('/api/goals');
  return data.goals;
}

export async function getGoalsReport() {
  const { data } = await api.get('/api/goals/report');
  return { goals: data.goals, averageMonthlyNetSavings: data.averageMonthlyNetSavings };
}

export async function createGoal(payload) {
  try {
    const { data } = await api.post('/api/goals', payload);
    return data.goal;
  } catch (e) {
    throw new Error(pickMessage(e));
  }
}

export async function updateGoal(id, payload) {
  try {
    const { data } = await api.put(`/api/goals/${id}`, payload);
    return data.goal;
  } catch (e) {
    throw new Error(pickMessage(e));
  }
}

export async function deleteGoal(id) {
  const { data } = await api.delete(`/api/goals/${id}`);
  return data;
}

export async function addSaving(id, amount) {
  try {
    const { data } = await api.post(`/api/goals/${id}/add-saving`, { amount });
    return data.goal;
  } catch (e) {
    throw new Error(pickMessage(e));
  }
}
