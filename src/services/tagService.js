import api from './api.js';

function pickMessage(e) {
  return e.response?.data?.message || e.message || 'Request failed';
}

export async function listTags() {
  const { data } = await api.get('/api/tags');
  return data.tags;
}

export async function createTag(payload) {
  try {
    const { data } = await api.post('/api/tags', payload);
    return data.tag;
  } catch (e) {
    throw new Error(pickMessage(e));
  }
}

export async function updateTag(id, payload) {
  try {
    const { data } = await api.put(`/api/tags/${id}`, payload);
    return data.tag;
  } catch (e) {
    throw new Error(pickMessage(e));
  }
}

export async function deleteTag(id) {
  const { data } = await api.delete(`/api/tags/${id}`);
  return data;
}
