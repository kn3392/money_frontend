import api from './api.js';
import { getAccountSummary } from './accountService.js';
import { enrichDashboardCashFlow } from '../utils/dashboardPayload.js';

/**
 * Portfolio summary: cashFlow, summary rows, totalAvailableBalance, hasNegativeBalance.
 * Falls back to GET /api/accounts/summary if /dashboard/summary is missing (older API).
 */
export async function getDashboardSummary() {
  try {
    const { data } = await api.get('/api/dashboard/summary');
    return enrichDashboardCashFlow(data);
  } catch (e) {
    const status = e.response?.status;
    if (status === 404) {
      return enrichDashboardCashFlow(await getAccountSummary());
    }
    throw e;
  }
}
