import api from './api.js';

function pickMessage(e) {
  return e.response?.data?.message || e.message || 'Request failed';
}

export async function listSplits() {
  const { data } = await api.get('/api/splits');
  return data.splits;
}

export async function getSplitsReport() {
  const { data } = await api.get('/api/splits/report');
  return data;
}

export async function createSplit(payload) {
  try {
    const { data } = await api.post('/api/splits', payload);
    return data.split;
  } catch (e) {
    throw new Error(pickMessage(e));
  }
}

export async function updateSplit(id, payload) {
  try {
    const { data } = await api.put(`/api/splits/${id}`, payload);
    return data.split;
  } catch (e) {
    throw new Error(pickMessage(e));
  }
}

export async function deleteSplit(id) {
  const { data } = await api.delete(`/api/splits/${id}`);
  return data;
}

export async function settleParticipant(splitId, participantId, amount) {
  try {
    const { data } = await api.post(`/api/splits/${splitId}/settle-participant`, {
      participantId,
      amount,
    });
    return data.split;
  } catch (e) {
    throw new Error(pickMessage(e));
  }
}
