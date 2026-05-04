import api from './api.js';

export async function getAccounts() {
  const { data } = await api.get('/api/accounts');
  return data.accounts;
}

export async function createAccount(payload) {
  const { data } = await api.post('/api/accounts', payload);
  return data.account;
}

export async function updateAccount(id, payload) {
  const { data } = await api.put(`/api/accounts/${id}`, payload);
  return data.account;
}

export async function deleteAccount(id) {
  const { data } = await api.delete(`/api/accounts/${id}`);
  return data;
}

export async function getAccountSummary() {
  const { data } = await api.get('/api/accounts/summary');
  return data;
}
