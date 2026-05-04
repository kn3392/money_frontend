import api from './api.js';

export function getAssetsOrigin() {
  const raw = api.defaults.baseURL || '';
  if (raw) {
    try {
      const url = new URL(raw);
      return url.origin;
    } catch {
      return raw.replace(/\/api\/?$/i, '');
    }
  }
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export function absoluteUploadUrl(serverPath) {
  if (!serverPath) return '';
  if (/^https?:\/\//i.test(serverPath)) return serverPath;
  return `${getAssetsOrigin()}${serverPath.startsWith('/') ? '' : '/'}${serverPath}`;
}

/** @returns {{ url: string, ...meta }} */
export async function uploadReceipt(file) {
  const fd = new FormData();
  fd.append('receipt', file);
  const { data } = await api.post('/api/uploads/receipt', fd, {
    timeout: 60_000,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
