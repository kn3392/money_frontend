import api from './api.js';

export async function listNotifications(params = {}) {
  const { data } = await api.get('/api/notifications', { params });
  return data;
}

export async function getUnreadCount() {
  const { data } = await api.get('/api/notifications/unread-count');
  return data.unreadCount;
}

export async function markRead(id) {
  const { data } = await api.put(`/api/notifications/${id}/read`);
  return data.notification;
}

export async function markAllRead() {
  const { data } = await api.put('/api/notifications/read-all');
  return data;
}

export async function deleteNotification(id) {
  const { data } = await api.delete(`/api/notifications/${id}`);
  return data;
}
