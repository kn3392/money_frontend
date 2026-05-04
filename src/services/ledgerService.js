import api from './api.js';

export async function getDayLedger(dateKey) {
  const { data } = await api.get(`/api/ledger/day/${encodeURIComponent(dateKey)}`);
  return data;
}

export async function lockDay(dateKey) {
  const { data } = await api.put(`/api/ledger/day/${encodeURIComponent(dateKey)}/lock`);
  return data;
}

export async function unlockDay(dateKey) {
  const { data } = await api.put(
    `/api/ledger/day/${encodeURIComponent(dateKey)}/unlock`
  );
  return data;
}
