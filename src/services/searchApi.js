import api from './api.js';

/**
 * Server-side transaction search (amount, date range, note, filters, pagination).
 * @param {Record<string, string | number | undefined>} params
 */
export async function searchTransactions(params) {
  const { data } = await api.get('/api/transactions/search', { params });
  return data;
}
