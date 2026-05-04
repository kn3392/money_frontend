import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  Tag,
  LogOut,
  Loader2,
  AlertCircle,
  LayoutDashboard,
  NotebookText,
  Users,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  FileDown,
  Search,
  PiggyBank,
  Landmark,
  UsersRound,
  Bookmark,
  Bell,
  LineChart,
  ScrollText,
  AlertTriangle,
  Calculator,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../hooks/useAuth';
import { getDashboardSummary } from '../services/dashboardService.js';
import * as ledgerService from '../services/ledgerService.js';
import { istTodayDateKey } from '../utils/istDate.js';
import { formatDateKey } from '../utils/dateFormatter.js';
import { getUserDisplayName } from '../utils/userDisplayName.js';

function formatMoney(n) {
  return Number(n ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function moneyClass(n) {
  const v = Number(n ?? 0);
  if (v < 0) return 'text-red-700';
  return 'text-slate-900';
}

function recentFive(ledger) {
  const list = [...(ledger?.transactions ?? [])];
  list.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
  return list.slice(0, 5);
}

export default function Dashboard() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dash, setDash] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const todayKey = istTodayDateKey();

  useEffect(() => {
    let cancelled = false;
    Promise.all([getDashboardSummary(), ledgerService.getDayLedger(todayKey)])
      .then(([d, ld]) => {
        if (!cancelled) {
          setDash(d);
          setLedger(ld);
        }
      })
      .catch((e) => {
        if (!cancelled)
          setError(e.response?.data?.message || e.message || 'Could not load data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [todayKey]);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const recent = recentFive(ledger);
  const cf = dash?.cashFlow;
  const summaryRows = dash?.summary ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-emerald-600" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                {t('dashboard')}
              </h1>
              <p className="text-sm text-slate-600">
                Welcome,{' '}
                <span className="font-medium">{getUserDisplayName(user)}</span>
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <Link
              to={`/ledger/${todayKey}`}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <NotebookText className="h-4 w-4" />
              {t('dailyLedger')}
            </Link>
            <Link
              to="/persons"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Users className="h-4 w-4" />
              {t('person')}
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Search className="h-4 w-4" />
              {t('search')}
            </Link>
            <Link
              to="/recurring"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw className="h-4 w-4" />
              {t('recurring')}
            </Link>
            <Link
              to="/export-backup"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <FileDown className="h-4 w-4" />
              {t('export')}
            </Link>
            <Link
              to="/budgets"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Wallet className="h-4 w-4" />
              {t('budgets')}
            </Link>
            <Link
              to="/goals"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <PiggyBank className="h-4 w-4" />
              {t('savingsGoals')}
            </Link>
            <Link
              to="/loans"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Landmark className="h-4 w-4" />
              {t('loans')}
            </Link>

            <Link
              to="/interest-book"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Calculator className="h-4 w-4" />
              Interest Book
            </Link>

            <Link
              to="/tags"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Bookmark className="h-4 w-4" />
              {t('tags')}
            </Link>
            <Link
              to="/notifications"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Bell className="h-4 w-4" />
              {t('notifications')}
            </Link>
            <Link
              to="/advanced-reports"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LineChart className="h-4 w-4" />
              {t('advancedReports')}
            </Link>
            <Link
              to="/audit-logs"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <ScrollText className="h-4 w-4" />
              {t('auditLogs')}
            </Link>
            <Link
              to="/accounts"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Wallet className="h-4 w-4" />
              Accounts
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Tag className="h-4 w-4" />
              Categories
            </Link>
            <Link
              to="/profile"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {dash?.hasNegativeBalance && (
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">{t('negativeBalance')}</p>
              <p className="mt-0.5 text-amber-800/90">{t('negativeBalanceHint')}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20 text-slate-500">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        ) : dash ? (
          <>
            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                {t('cashFlowSummary')}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {t('totalIncome')} / {t('totalExpense')} — {t('transfer')} excluded from
                income &amp; expense totals.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-xs font-medium uppercase text-slate-500">
                    {t('portfolioOpening')}
                  </p>
                  <p className={`mt-2 text-lg font-semibold tabular-nums ${moneyClass(cf?.openingBalanceTotal)}`}>
                    ₹ {formatMoney(cf?.openingBalanceTotal)}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-4">
                  <p className="flex items-center gap-1 text-xs font-medium uppercase text-emerald-800">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {t('totalIncome')}
                  </p>
                  <p className="mt-2 text-lg font-semibold tabular-nums text-emerald-900">
                    ₹ {formatMoney(cf?.totalIncome)}
                  </p>
                </div>
                <div className="rounded-xl border border-red-100 bg-red-50/80 p-4">
                  <p className="flex items-center gap-1 text-xs font-medium uppercase text-red-800">
                    <TrendingDown className="h-3.5 w-3.5" />
                    {t('totalExpense')}
                  </p>
                  <p className="mt-2 text-lg font-semibold tabular-nums text-red-900">
                    ₹ {formatMoney(cf?.totalExpense)}
                  </p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <p className="text-xs font-medium uppercase text-blue-900">
                    {t('netSavings')}
                  </p>
                  <p className={`mt-2 text-lg font-semibold tabular-nums ${moneyClass(cf?.netSavings)}`}>
                    ₹ {formatMoney(cf?.netSavings)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:col-span-2 lg:col-span-1">
                  <p className="text-xs font-medium uppercase text-slate-500">
                    {t('portfolioClosing')}
                  </p>
                  <p className={`mt-2 text-lg font-semibold tabular-nums ${moneyClass(cf?.closingBalanceTotal)}`}>
                    ₹ {formatMoney(cf?.closingBalanceTotal)}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-600">{t('account')}s</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                    {dash.totalAccounts}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <p className="text-sm font-medium text-emerald-900">
                    Total available balance
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-800">
                    ₹ {formatMoney(dash.totalAvailableBalance)}
                  </p>
                  <p className="mt-1 text-xs text-emerald-800/80">
                    Sum of current balance on each active account (synced from entries).
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {t('accountBalances')}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {summaryRows.map((row) => (
                  <div
                    key={row.id}
                    className={`rounded-xl border bg-white p-5 shadow-sm ${
                      row.currentBalance < 0
                        ? 'border-red-200 ring-1 ring-red-100'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{row.name}</p>
                        <p className="text-xs uppercase text-slate-500">Type: {row.type}</p>
                      </div>
                      <Wallet className="h-5 w-5 shrink-0 text-emerald-600 opacity-80" />
                    </div>
                    {row.currentBalance < 0 && (
                      <span className="mt-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                        {t('negativeBalance')}
                      </span>
                    )}
                    <dl className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between gap-2 border-b border-slate-50 pb-2">
                        <dt className="text-slate-600">{t('openingBalanceLabel')}</dt>
                        <dd className="tabular-nums font-medium text-slate-800">
                          ₹ {formatMoney(row.openingBalance)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2 border-b border-slate-50 pb-2">
                        <dt className="text-slate-600">{t('currentBalanceLabel')}</dt>
                        <dd className={`tabular-nums font-semibold ${moneyClass(row.currentBalance)}`}>
                          ₹ {formatMoney(row.currentBalance)}
                        </dd>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <dt>{t('totalIncome')}</dt>
                        <dd className="tabular-nums text-emerald-700">
                          ₹ {formatMoney(row.totalIncome)}
                        </dd>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <dt>{t('totalExpense')}</dt>
                        <dd className="tabular-nums text-red-600">
                          ₹ {formatMoney(row.totalExpense)}
                        </dd>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <dt>{t('transferIn')}</dt>
                        <dd className="tabular-nums">₹ {formatMoney(row.totalTransferIn)}</dd>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <dt>{t('transferOut')}</dt>
                        <dd className="tabular-nums">₹ {formatMoney(row.totalTransferOut)}</dd>
                      </div>
                      <div className="border-t border-slate-100 pt-2">
                        <div className="flex justify-between text-xs font-medium text-slate-800">
                          <dt>{t('netMovement')}</dt>
                          <dd className={`tabular-nums ${moneyClass(row.netMovement)}`}>
                            ₹ {formatMoney(row.netMovement)}
                          </dd>
                        </div>
                        <p className="mt-1 text-[11px] leading-snug text-slate-500">
                          {t('netMovementHint')}
                        </p>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </section>

            {ledger && (
              <section className="mb-8">
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Today · {formatDateKey(ledger.date)}
                  </h2>
                  <Link
                    to={`/ledger/${todayKey}`}
                    className="text-sm font-medium text-emerald-700 hover:underline"
                  >
                    Open daily ledger →
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium uppercase text-slate-500">
                      {t('opening')}
                    </p>
                    <p className="mt-2 text-xl font-semibold tabular-nums">
                      ₹ {formatMoney(ledger.openingBalance)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-5 shadow-sm">
                    <p className="flex items-center gap-1 text-xs font-medium uppercase text-emerald-800">
                      <TrendingUp className="h-4 w-4" />
                      {t('income')}
                    </p>
                    <p className="mt-2 text-xl font-semibold tabular-nums text-emerald-900">
                      ₹ {formatMoney(ledger.totalIncome)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-red-100 bg-red-50/80 p-5 shadow-sm">
                    <p className="flex items-center gap-1 text-xs font-medium uppercase text-red-800">
                      <TrendingDown className="h-4 w-4" />
                      {t('expense')}
                    </p>
                    <p className="mt-2 text-xl font-semibold tabular-nums text-red-900">
                      ₹ {formatMoney(ledger.totalExpense)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium uppercase text-slate-500">
                      {t('closing')}
                    </p>
                    <p className="mt-2 text-xl font-semibold tabular-nums text-slate-900">
                      ₹ {formatMoney(ledger.closingBalance)}
                    </p>
                    {ledger.isLocked && (
                      <p className="mt-2 text-xs text-amber-700">Day is locked</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {ledger && (
              <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Recent on today ({recent.length})
                  </h2>
                  <Link
                    to={`/ledger/${todayKey}`}
                    className="text-xs font-medium text-emerald-700 hover:underline"
                  >
                    Manage entries
                  </Link>
                </div>
                {recent.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                    No transactions logged today yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {recent.map((tx) => (
                      <li key={tx.id} className="flex flex-wrap items-start gap-4 py-3 text-sm">
                        <span className="w-24 shrink-0 font-medium capitalize text-slate-800">
                          {tx.type}
                        </span>
                        <span className="min-w-[6rem] font-semibold tabular-nums text-slate-900">
                          ₹ {formatMoney(tx.amount)}
                        </span>
                        <div className="min-w-0 flex-1 text-slate-600">
                          {tx.type === 'transfer' ? (
                            <span className="text-xs text-slate-500">
                              {tx.fromAccount?.name ?? '—'} → {tx.toAccount?.name ?? '—'}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">
                              {[tx.category?.name, tx.account?.name]
                                .filter(Boolean)
                                .join(' · ')}
                              {tx.person?.name ? ` · ${tx.person.name}` : ''}
                            </span>
                          )}
                          {tx.note && (
                            <p className="mt-0.5 font-medium text-slate-900">{tx.note}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </>
        ) : null}

        <p className="mt-10 text-center">
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
            ← Home
          </Link>
        </p>
      </main>
    </div>
  );
}
