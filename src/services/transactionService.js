import api from './api.js';

export async function createTransaction(payload) {
  const { data } = await api.post('/api/transactions', payload);
  return data.transaction;
}

export async function updateTransaction(id, payload) {
  const { data } = await api.put(`/api/transactions/${id}`, payload);
  return data.transaction;
}

export async function deleteTransaction(id) {
  const { data } = await api.delete(`/api/transactions/${id}`);
  return data;
}

export async function undoLastTransaction() {
  const { data } = await api.post('/api/transactions/undo-last');
  return data;
}
