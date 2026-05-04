import api from './api.js';

function downloadBlob(filename, blob) {
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(href);
}

export async function downloadDailyPdf(dateKey) {
  const res = await api.get(`/api/export/daily`, {
    params: { date: dateKey, type: 'pdf' },
    responseType: 'blob',
    timeout: 60_000,
  });
  downloadBlob(`daily-${dateKey}.pdf`, res.data);
}

export async function downloadMonthlyPdf(month, year) {
  const res = await api.get(`/api/export/monthly`, {
    params: { month, year, type: 'pdf' },
    responseType: 'blob',
    timeout: 120_000,
  });
  downloadBlob(`monthly-${year}-${month}.pdf`, res.data);
}

export async function downloadFYPdf(fyLabel) {
  const res = await api.get(`/api/export/financial-year`, {
    params: { financialYear: fyLabel, type: 'pdf' },
    responseType: 'blob',
    timeout: 180_000,
  });
  downloadBlob(`fy-${fyLabel.replace(/[^\w.-]+/g, '_')}.pdf`, res.data);
}

export async function downloadTransactionsExcel() {
  const res = await api.get(`/api/export/transactions`, {
    params: { type: 'excel' },
    responseType: 'blob',
    timeout: 180_000,
  });
  downloadBlob('transactions.xlsx', res.data);
}

export async function downloadJsonBackup() {
  const res = await api.get(`/api/export/backup`, {
    params: { type: 'json' },
    responseType: 'blob',
    timeout: 240_000,
  });
  downloadBlob(`smartkhata-backup-${Date.now()}.json`, res.data);
}

export async function restoreBackupJson(file, { replaceExisting }) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('confirmRestore', String(true));
  fd.append('replaceExisting', replaceExisting ? 'true' : 'false');
  const { data } = await api.post('/api/export/restore-backup', fd, {
    timeout: 240_000,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
