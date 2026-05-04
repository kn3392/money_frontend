import api from './api.js';

export async function getProfileOverview() {
  const { data } = await api.get('/api/auth/profile-overview');
  return data;
}

export async function updateProfileName(name) {
  const { data } = await api.patch('/api/auth/profile', { name });
  return data;
}

export async function changePassword(currentPassword, newPassword) {
  const { data } = await api.put('/api/auth/password', {
    currentPassword,
    newPassword,
  });
  return data;
}
