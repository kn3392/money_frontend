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
  Bookmark,
  Bell,
  LineChart,
  ScrollText,
  AlertTriangle,
  Calculator,
  Menu,
  X,
  IndianRupee,
  User,
  ChevronRight,
  ArrowRightLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  return Number(n ?? 0) < 0 ? 'text-red-600' : 'text-slate-900';
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

const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { to: null, icon: LayoutDashboard, labelKey: 'dashboard', active: true },
      { to: '/ledger', icon: NotebookText, labelKey: 'dailyLedger' },
      { to: '/search', icon: Search, labelKey: 'search' },
      { to: '/accounts', icon: Wallet, labelKey: 'accounts' },
      { to: '/categories', icon: Tag, labelKey: 'category' },
      { to: '/persons', icon: Users, labelKey: 'person' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/budgets', icon: Wallet, labelKey: 'budgets' },
      { to: '/goals', icon: PiggyBank, labelKey: 'savingsGoals' },
      { to: '/loans', icon: Landmark, labelKey: 'loans' },
      { to: '/interest-book', icon: Calculator, labelKey: 'interestBook' },
      { to: '/splits', icon: ArrowRightLeft, labelKey: 'splitExpenses' },
      { to: '/recurring', icon: RefreshCw, labelKey: 'recurring' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/tags', icon: Bookmark, labelKey: 'tags' },
      { to: '/notifications', icon: Bell, labelKey: 'notifications' },
      { to: '/advanced-reports', icon: LineChart, labelKey: 'advancedReports' },
      { to: '/audit-logs', icon: ScrollText, labelKey: 'auditLogs' },
      { to: '/export-backup', icon: FileDown, labelKey: 'export' },
    ],
  },
];

function Sidebar({ open, onClose, t, user, onLogout }) {
  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none lg:border-r lg:border-slate-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
              <IndianRupee className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-900">SmartKhata</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, labelKey, active }) => {
                  const cls = `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`;
                  return (
                    <li key={labelKey}>
                      {to ? (
                        <Link to={to === '/ledger' ? `/ledger/${istTodayDateKey()}` : to} className={cls} onClick={onClose}>
                          <Icon className="h-4 w-4 shrink-0" />
                          {t(labelKey)}
                        </Link>
                      ) : (
                        <span className={cls}>
                          <Icon className="h-4 w-4 shrink-0" />
                          {t(labelKey)}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-100 p-3 space-y-1">
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
              {getUserDisplayName(user)?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <span className="min-w-0 flex-1 truncate">{getUserDisplayName(user)}</span>
            <User className="h-4 w-4 shrink-0 text-slate-400" />
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {t('logout')}
          </button>
        </div>
      </aside>
    </>
  );
}

export default function Dashboard() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dash, setDash] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const todayKey = istTodayDateKey();

  useEffect(() => {
    let cancelled = false;
    Promise.all([getDashboardSummary(), ledgerService.getDayLedger(todayKey)])
      .then(([d, ld]) => {
        if (!cancelled) { setDash(d); setLedger(ld); }
      })
      .catch((e) => {
        if (!cancelled)
          setError(e.response?.data?.message || e.message || 'Could not load data');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [todayKey]);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const recent = recentFive(ledger);
  const cf = dash?.cashFlow;
  const summaryRows = dash?.summary ?? [];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        t={t}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <IndianRupee className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-900">SmartKhata</span>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-base font-semibold text-slate-900">{t('dashboard')}</h1>
              <p className="text-xs text-slate-500">
                {t('welcomeBack')} {getUserDisplayName(user)}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link
                to={`/ledger/${todayKey}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <NotebookText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('dailyLedger')}</span>
              </Link>
              <Link
                to="/search"
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label={t('search')}
              >
                <Search className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 py-6 lg:px-6">
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {dash?.hasNegativeBalance && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">{t('negativeBalance')}</p>
                <p className="mt-0.5 text-amber-800/90">{t('negativeBalanceHint')}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
              <p className="text-sm">Loading your finances…</p>
            </div>
          ) : dash ? (
            <div className="space-y-6">

              {/* Today's ledger summary */}
              {ledger && (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-700">
                      {t('todayLabel')} · {formatDateKey(ledger.date)}
                      {ledger.isLocked && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          {t('locked')}
                        </span>
                      )}
                    </h2>
                    <Link
                      to={`/ledger/${todayKey}`}
                      className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
                    >
                      {t('openDailyLedger')} <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: t('opening'), value: ledger.openingBalance, color: 'bg-slate-50 border-slate-200', textColor: '' },
                      { label: t('income'), value: ledger.totalIncome, color: 'bg-emerald-50 border-emerald-100', textColor: 'text-emerald-800', icon: TrendingUp },
                      { label: t('expense'), value: ledger.totalExpense, color: 'bg-red-50 border-red-100', textColor: 'text-red-800', icon: TrendingDown },
                      { label: t('closing'), value: ledger.closingBalance, color: 'bg-white border-slate-200', textColor: '' },
                    ].map(({ label, value, color, textColor, icon: Icon }) => (
                      <div key={label} className={`rounded-2xl border p-4 ${color}`}>
                        <p className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wide ${textColor || 'text-slate-500'}`}>
                          {Icon && <Icon className="h-3.5 w-3.5" />}
                          {label}
                        </p>
                        <p className={`mt-2 text-xl font-bold tabular-nums ${textColor || moneyClass(value)}`}>
                          ₹{formatMoney(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Portfolio cash flow */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-700">{t('cashFlowSummary')}</h2>
                  <p className="text-xs text-slate-400">{t('transferExcluded')}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {[
                    { label: t('portfolioOpening'), value: cf?.openingBalanceTotal, cls: 'bg-slate-50 border-slate-200' },
                    { label: t('totalIncome'), value: cf?.totalIncome, cls: 'bg-emerald-50 border-emerald-100', valCls: 'text-emerald-800' },
                    { label: t('totalExpense'), value: cf?.totalExpense, cls: 'bg-red-50 border-red-100', valCls: 'text-red-800' },
                    { label: t('netSavings'), value: cf?.netSavings, cls: 'bg-blue-50 border-blue-100', valCls: 'text-blue-800' },
                    { label: t('portfolioClosing'), value: cf?.closingBalanceTotal, cls: 'bg-white border-slate-200' },
                  ].map(({ label, value, cls, valCls }) => (
                    <div key={label} className={`rounded-2xl border p-4 ${cls}`}>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 leading-tight">{label}</p>
                      <p className={`mt-2 text-lg font-bold tabular-nums ${valCls || moneyClass(value)}`}>
                        ₹{formatMoney(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Total available */}
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-100">{t('totalAvailableStat')}</p>
                    <p className="mt-1 text-3xl font-extrabold tabular-nums">
                      ₹{formatMoney(dash.totalAvailableBalance)}
                    </p>
                    <p className="mt-1 text-xs text-emerald-200">
                      {dash.totalAccounts} {t('accounts')}
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                    <Wallet className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Account balances */}
              {summaryRows.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-700">{t('accountBalances')}</h2>
                    <Link to="/accounts" className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline">
                      {t('accounts')} <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {summaryRows.map((row) => (
                      <div
                        key={row.id}
                        className={`rounded-2xl border bg-white p-4 shadow-sm ${
                          row.currentBalance < 0 ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">{row.name}</p>
                            <p className="text-xs text-slate-400 capitalize mt-0.5">{row.type}</p>
                          </div>
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                            <Wallet className="h-4 w-4 text-emerald-600" />
                          </div>
                        </div>
                        {row.currentBalance < 0 && (
                          <span className="mb-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            {t('negativeBalance')}
                          </span>
                        )}
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">{t('openingBalanceLabel')}</span>
                            <span className="tabular-nums font-medium text-slate-700">₹{formatMoney(row.openingBalance)}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-50 pt-1.5">
                            <span className="font-medium text-slate-700">{t('currentBalanceLabel')}</span>
                            <span className={`tabular-nums font-bold ${moneyClass(row.currentBalance)}`}>
                              ₹{formatMoney(row.currentBalance)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-500">
                            <span className="text-emerald-700">↑ ₹{formatMoney(row.totalIncome)}</span>
                            <span className="text-red-600">↓ ₹{formatMoney(row.totalExpense)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Recent transactions */}
              {ledger && (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-700">
                      {t('recentToday')}
                      <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {recent.length}
                      </span>
                    </h2>
                    <Link
                      to={`/ledger/${todayKey}`}
                      className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
                    >
                      {t('manageEntries')} <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {recent.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                        <NotebookText className="h-8 w-8 opacity-40" />
                        <p className="text-sm">{t('noTodayTx')}</p>
                        <Link
                          to={`/ledger/${todayKey}`}
                          className="mt-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          {t('addTransaction')}
                        </Link>
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {recent.map((tx) => (
                          <li key={tx.id} className="flex items-center gap-3 px-4 py-3">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                              tx.type === 'income'
                                ? 'bg-emerald-100 text-emerald-700'
                                : tx.type === 'expense'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {tx.type === 'income' ? '↑' : tx.type === 'expense' ? '↓' : '⇄'}
                            </div>
                            <div className="min-w-0 flex-1">
                              {tx.type === 'transfer' ? (
                                <p className="text-xs text-slate-500 truncate">
                                  {tx.fromAccount?.name ?? '—'} → {tx.toAccount?.name ?? '—'}
                                </p>
                              ) : (
                                <p className="text-xs text-slate-500 truncate">
                                  {[tx.category?.name, tx.account?.name].filter(Boolean).join(' · ')}
                                  {tx.person?.name ? ` · ${tx.person.name}` : ''}
                                </p>
                              )}
                              {tx.note && (
                                <p className="text-sm font-medium text-slate-800 truncate">{tx.note}</p>
                              )}
                            </div>
                            <span className={`shrink-0 text-sm font-bold tabular-nums ${
                              tx.type === 'income' ? 'text-emerald-700' : tx.type === 'expense' ? 'text-red-600' : 'text-blue-700'
                            }`}>
                              ₹{formatMoney(tx.amount)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              )}

              {/* Quick links grid */}
              <section>
                <h2 className="mb-3 text-sm font-semibold text-slate-700">Quick access</h2>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                  {[
                    { to: '/budgets', icon: Wallet, labelKey: 'budgets', color: 'text-violet-600 bg-violet-50' },
                    { to: '/goals', icon: PiggyBank, labelKey: 'savingsGoals', color: 'text-emerald-600 bg-emerald-50' },
                    { to: '/loans', icon: Landmark, labelKey: 'loans', color: 'text-amber-600 bg-amber-50' },
                    { to: '/interest-book', icon: Calculator, labelKey: 'interestBook', color: 'text-blue-600 bg-blue-50' },
                    { to: '/recurring', icon: RefreshCw, labelKey: 'recurring', color: 'text-teal-600 bg-teal-50' },
                    { to: '/advanced-reports', icon: LineChart, labelKey: 'advancedReports', color: 'text-rose-600 bg-rose-50' },
                  ].map(({ to, icon: Icon, labelKey, color }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm hover:border-slate-300 hover:shadow transition-all"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-slate-700 leading-tight">{t(labelKey)}</span>
                    </Link>
                  ))}
                </div>
              </section>

            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
