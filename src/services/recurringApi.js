import api from './api.js';

export async function listRecurring() {
  const { data } = await api.get('/api/recurring');
  return data;
}

export async function createRecurring(payload) {
  const { data } = await api.post('/api/recurring', payload);
  return data.recurring;
}

export async function updateRecurring(id, payload) {
  const { data } = await api.put(`/api/recurring/${id}`, payload);
  return data.recurring;
}

export async function deleteRecurring(id) {
  await api.delete(`/api/recurring/${id}`);
}

export async function runDueRecurring() {
  const { data } = await api.post('/api/recurring/run-due');
  return data;
}
