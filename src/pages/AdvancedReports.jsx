import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import * as reportService from '../services/advancedReportService.js';
import {
  DailyTrendChart,
  CategoryComparisonChart,
  AccountMovementChart,
} from '../components/reports/AdvancedReportCharts.jsx';
import { istTodayDateKey } from '../utils/istDate.js';

function addDays(key, delta) {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

export default function AdvancedReports() {
  const { t } = useLanguage();
  const today = istTodayDateKey();
  const [dateFrom, setDateFrom] = useState(addDays(today, -30));
  const [dateTo, setDateTo] = useState(today);
  const [fy, setFy] = useState('2026-27');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cashFlow, setCashFlow] = useState(null);
  const [daily, setDaily] = useState(null);
  const [persons, setPersons] = useState(null);
  const [movement, setMovement] = useState(null);
  const [catCmp, setCatCmp] = useState(null);
  const [tax, setTax] = useState(null);
  const [topEx, setTopEx] = useState(null);
  const [noEntry, setNoEntry] = useState(null);
  const [budgetAct, setBudgetAct] = useState(null);
  const [goalsRep, setGoalsRep] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [
        cf,
        dt,
        ps,
        mv,
        cc,
        txSum,
        te,
        ne,
        bva,
        sg,
      ] = await Promise.all([
        reportService.cashFlow({ dateFrom, dateTo }),
        reportService.dailyTrend({ dateFrom, dateTo }),
        reportService.personSettlement(),
        reportService.accountMovement({ dateFrom, dateTo }),
        reportService.categoryComparison(),
        reportService.financialYearTaxSummary(fy),
        reportService.topExpenses({ dateFrom, dateTo, limit: 10 }),
        reportService.noEntryDays({ dateFrom, dateTo }),
        reportService.budgetVsActual({}),
        reportService.savingsGoalsReport(),
      ]);
      setCashFlow(cf);
      setDaily(dt);
      setPersons(ps);
      setMovement(mv);
      setCatCmp(cc);
      setTax(txSum);
      setTopEx(te);
      setNoEntry(ne);
      setBudgetAct(bva);
      setGoalsRep(sg);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, fy]);

  useEffect(() => {
    void run();
  }, [run]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-4">
          <Link to="/dashboard" className="rounded-lg p-2 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">{t('advancedReports')}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <section className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4 shadow-sm">
          <div>
            <label className="text-xs text-slate-600">{t('dateFrom')}</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 block rounded border px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">{t('dateTo')}</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1 block rounded border px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">{t('financialYear')}</label>
            <input
              value={fy}
              onChange={(e) => setFy(e.target.value)}
              className="mt-1 block w-28 rounded border px-2 py-1 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => void run()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          >
            {t('refresh')}
          </button>
        </section>
        {error && (
          <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {loading && !cashFlow ? (
          <Loader2 className="mx-auto block h-10 w-10 animate-spin text-slate-400" />
        ) : (
          <>
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">{t('cashFlow')}</h2>
              {cashFlow && (
                <div className="grid gap-3 sm:grid-cols-4 text-sm">
                  <div>
                    <p className="text-slate-500">Opening</p>
                    <p className="text-lg font-semibold tabular-nums">₹{cashFlow.openingBalance}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Inflow</p>
                    <p className="text-lg font-semibold tabular-nums text-emerald-700">
                      ₹{cashFlow.inflow}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Outflow</p>
                    <p className="text-lg font-semibold tabular-nums text-red-600">
                      ₹{cashFlow.outflow}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Closing</p>
                    <p className="text-lg font-semibold tabular-nums">₹{cashFlow.closingBalance}</p>
                  </div>
                </div>
              )}
            </section>
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">{t('dailyTrend')}</h2>
              <DailyTrendChart days={daily?.days} />
            </section>
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">{t('categoryComparison')}</h2>
              <CategoryComparisonChart lines={catCmp?.lines} />
            </section>
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">{t('accountMovement')}</h2>
              <AccountMovementChart accounts={movement?.accounts} />
            </section>
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">{t('personSettlement')}</h2>
              <ul className="divide-y text-sm">
                {(persons?.persons ?? []).map((p) => (
                  <li key={String(p.id)} className="flex justify-between py-2">
                    <span>{p.name}</span>
                    <span className="tabular-nums">balance ₹{p.balance}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">{t('topExpenses')}</h2>
              <ul className="divide-y text-sm">
                {(topEx?.items ?? []).map((tx) => (
                  <li key={tx._id} className="flex justify-between py-2">
                    <span>
                      {tx.dateKey} · {tx.categoryId?.name} · {tx.note}
                    </span>
                    <span className="font-medium tabular-nums">₹{tx.amount}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">{t('noEntryDays')}</h2>
              <p className="text-sm text-slate-600">
                {t('noEntryCount')}: {noEntry?.count ?? 0}
              </p>
              <p className="mt-2 max-h-40 overflow-y-auto text-xs text-slate-500">
                {(noEntry?.noEntryDays ?? []).join(', ')}
              </p>
            </section>
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">{t('budgetVsActual')}</h2>
              <p className="text-xs text-slate-500">
                {budgetAct?.month}/{budgetAct?.year} — {budgetAct?.lines?.length ?? 0} lines
              </p>
            </section>
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">{t('savingsGoalsReport')}</h2>
              <p className="text-sm text-slate-600">
                Avg monthly net: ₹{goalsRep?.averageMonthlyNetSavings ?? 0}
              </p>
            </section>
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">{t('fyTaxSummary')}</h2>
              <p className="text-xs text-slate-500">{tax?.financialYear}</p>
              <p className="text-sm">
                Income categories: {tax?.incomeByCategory?.length ?? 0} · Expense:{' '}
                {tax?.expenseByCategory?.length ?? 0}
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
