import api from './api.js';

export async function getCategories(type) {
  const params = type ? { type } : {};
  const { data } = await api.get('/api/categories', { params });
  return data.categories;
}

export async function createCategory(payload) {
  const { data } = await api.post('/api/categories', payload);
  return data.category;
}

export async function updateCategory(id, payload) {
  const { data } = await api.put(`/api/categories/${id}`, payload);
  return data.category;
}

export async function deleteCategory(id) {
  const { data } = await api.delete(`/api/categories/${id}`);
  return data;
}
