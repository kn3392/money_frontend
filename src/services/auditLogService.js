import api from './api.js';

export async function listAuditLogs(params = {}) {
  const { data } = await api.get('/api/audit-logs', { params });
  return data;
}

export async function getAuditLog(id) {
  const { data } = await api.get(`/api/audit-logs/${id}`);
  return data.auditLog;
}
