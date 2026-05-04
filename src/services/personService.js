import api from './api.js';

export async function getPersons() {
  const { data } = await api.get('/api/persons');
  return data;
}

export async function getPersonDetail(id) {
  const { data } = await api.get(`/api/persons/${id}`);
  return data;
}

export async function createPerson(payload) {
  const { data } = await api.post('/api/persons', payload);
  return data.person;
}

export async function updatePerson(id, payload) {
  const { data } = await api.put(`/api/persons/${id}`, payload);
  return data.person;
}

export async function deletePerson(id) {
  const { data } = await api.delete(`/api/persons/${id}`);
  return data;
}
