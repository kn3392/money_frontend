import { useEffect, useState, useCallback } from 'react';
import {
  Navigate,
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  Unlock,
  NotebookText,
  PlusCircle,
  Wallet,
  Sparkles,
  Undo2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as ledgerService from '../services/ledgerService.js';
import * as accountService from '../services/accountService.js';
import * as categoryService from '../services/categoryService.js';
import * as personService from '../services/personService.js';
import * as txApi from '../services/transactionService.js';
import TransactionList from '../components/transactions/TransactionList.jsx';
import TransactionForm from '../components/transactions/TransactionForm.jsx';
import TransferForm from '../components/transactions/TransferForm.jsx';
import { istTodayDateKey } from '../utils/istDate.js';
import { formatDateKey } from '../utils/dateFormatter.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import LoadingSkeletonLedger from '../components/ui/LoadingSkeleton.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';

const DATE_RGX = /^\d{4}-\d{2}-\d{2}$/;

function shiftDateKey(cur, delta) {
  const [Y, M, D] = cur.split('-').map(Number);
  const dt = new Date(Date.UTC(Y, M - 1, D + delta));
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fmtMoney(n) {
  return Number(n ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const fn = () => setNarrow(mq.matches);
    fn();
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return narrow;
}

export default function DailyLedger() {
  const { date: routeDate } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { push } = useToast();
  const narrow = useNarrow();

  const rawDate = routeDate ?? '';
  const isValidDate = DATE_RGX.test(rawDate);
  const fetchDateKey = isValidDate ? rawDate : '';

  const [ledger, setLedger] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [panel, setPanel] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [mobileTab, setMobileTab] = useState('expense');

  const [pendingDeleteTx, setPendingDeleteTx] = useState(null);
  const [undoOpen, setUndoOpen] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockBusy, setLockBusy] = useState(false);

  const loadAll = useCallback(async () => {
    if (!fetchDateKey) return;
    setLoading(true);
    setError('');
    try {
      const [ld, ac, cats, pdata] = await Promise.all([
        ledgerService.getDayLedger(fetchDateKey),
        accountService.getAccounts(),
        categoryService.getCategories(),
        personService.getPersons(),
      ]);
      setLedger(ld);
      setAccounts(ac ?? []);
      setCategories(cats ?? []);
      const plist = pdata?.persons ?? [];
      setPersons(plist.filter((p) => p.isActive !== false));
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [fetchDateKey]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  if (!isValidDate) {
    return <Navigate to={`/ledger/${istTodayDateKey()}`} replace />;
  }

  const dateKey = rawDate;

  async function refresh() {
    await loadAll();
    setPanel(null);
    setEditingTx(null);
  }

  async function applyLock(locking) {
    setLockBusy(true);
    try {
      if (locking) await ledgerService.lockDay(dateKey);
      else await ledgerService.unlockDay(dateKey);
      push(locking ? t('locked') : t('unlockDay'));
      await refresh();
    } catch (e) {
      push(e.response?.data?.message || e.message, 'error');
    } finally {
      setLockBusy(false);
      setLockModalOpen(false);
    }
  }

  async function onSubmitIe(payload, txId) {
    if (txId) await txApi.updateTransaction(txId, payload);
    else await txApi.createTransaction(payload);
    push(t('saved'));
    await refresh();
  }

  function startEdit(tx) {
    setEditingTx(tx);
    if (tx.type === 'transfer') setPanel('editTransfer');
    else setPanel('editIe');
  }

  async function confirmDelete() {
    if (!pendingDeleteTx) return;
    try {
      await txApi.deleteTransaction(pendingDeleteTx.id);
      push(t('delete') + ' · OK');
      setPendingDeleteTx(null);
      await refresh();
    } catch (e) {
      push(e.response?.data?.message || e.message, 'error');
    }
  }

  async function confirmUndo() {
    try {
      await txApi.undoLastTransaction();
      push(t('undo') + ' · OK');
      setUndoOpen(false);
      await refresh();
    } catch (e) {
      push(e.response?.data?.message || e.message, 'error');
    }
  }

  const locked = ledger?.isLocked;
  const expenseList = ledger?.transactionsExpense ?? [];
  const incomeList = ledger?.transactionsIncome ?? [];
  const xferList = ledger?.transactionsTransfer ?? [];
  const totalsEmpty =
    !expenseList.length && !incomeList.length && !xferList.length;

  if (loading && !ledger && !error) return <LoadingSkeletonLedger />;
  if (error && !ledger)
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <ErrorState title={t('ledgerError')} message={error}>
          <button
            type="button"
            className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white"
            onClick={() => void loadAll()}
          >
            {t('retryBtn')}
          </button>
        </ErrorState>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:pb-16">
      <ConfirmModal
        open={Boolean(pendingDeleteTx)}
        title={t('delete')}
        message={t('balancesReverse')}
        confirmLabel={t('delete')}
        destructive
        onCancel={() => setPendingDeleteTx(null)}
        onConfirm={() => void confirmDelete()}
      />
      <ConfirmModal
        open={undoOpen}
        title={t('undo')}
        message={t('undoHint')}
        confirmLabel={t('undo')}
        onCancel={() => setUndoOpen(false)}
        onConfirm={() => void confirmUndo()}
      />
      <ConfirmModal
        open={lockModalOpen}
        title={locked ? t('unlockDay') : t('lockDay')}
        message={locked ? t('unlockHint') : t('lockHint')}
        busy={lockBusy}
        confirmLabel={t('confirm')}
        onCancel={() => !lockBusy && setLockModalOpen(false)}
        onConfirm={() => void applyLock(!locked)}
      />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              to="/dashboard"
              className="text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              ← {t('dashboard')}
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <NotebookText className="h-6 w-6 text-emerald-600" />
              <h1 className="text-xl font-semibold text-slate-900">
                {t('dailyLedger')} · {formatDateKey(dateKey)}
              </h1>
              {locked && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900">
                  {t('locked')}
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/ledger/${shiftDateKey(dateKey, -1)}`)}
                className="rounded-lg border border-slate-300 p-2 hover:bg-slate-50"
                aria-label="Previous day"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => navigate(`/ledger/${shiftDateKey(dateKey, 1)}`)}
                className="rounded-lg border border-slate-300 p-2 hover:bg-slate-50"
                aria-label="Next day"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => navigate(`/ledger/${istTodayDateKey()}`)}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <Sparkles className="h-4 w-4" />
                {t('today')}
              </button>
              <input
                type="date"
                value={dateKey}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v) navigate(`/ledger/${v}`);
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setLockModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
              >
                {!locked ? (
                  <>
                    <Lock className="h-4 w-4" /> {t('lockDay')}
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4" /> {t('unlockDay')}
                  </>
                )}
              </button>
              {!locked && (
                <button
                  type="button"
                  onClick={() => setUndoOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2 text-sm text-orange-950 hover:bg-orange-100"
                >
                  <Undo2 className="h-4 w-4" />
                  {t('undo')}
                </button>
              )}
            </div>
          </motion.div>
          <nav className="flex flex-wrap gap-2">
            <Link
              to="/accounts"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Wallet className="h-4 w-4" /> {t('account')}
            </Link>
            <Link
              to="/persons"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {t('person')}
            </Link>
            <Link
              to="/recurring"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {t('recurring')}
            </Link>
            <Link
              to="/export-backup"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {t('export')}
            </Link>
          </nav>
        </div>
      </header>

      {narrow && ledger && (
        <div className="mx-auto mt-4 flex max-w-6xl gap-2 px-4 lg:hidden">
          {['expense', 'income', 'transfer'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMobileTab(tab)}
              className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold capitalize ${
                mobileTab === tab
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200'
              }`}
            >
              {tab === 'expense'
                ? t('expense')
                : tab === 'income'
                  ? t('income')
                  : t('transfer')}
            </button>
          ))}
        </div>
      )}

      {ledger && locked && (
        <div className="mx-auto mt-4 max-w-6xl px-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {t('lockedHint')}
            {ledger.lockedAt && (
              <span className="block text-xs text-amber-800 mt-1">
                {t('lockedAt')}:{' '}
                {new Date(ledger.lockedAt).toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                })}
              </span>
            )}
          </div>
        </div>
      )}

      {ledger && totalsEmpty && !loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto mt-8 max-w-6xl px-4 text-center text-sm text-slate-500"
        >
          {t('quietDay')}
        </motion.p>
      )}

      {ledger && (
        <>
          <section className="mx-auto mt-6 grid max-w-6xl gap-4 px-4 sm:grid-cols-4">
            {[
              [t('opening'), ledger.openingBalance, 'border-slate-200'],
              [t('totalIncome'), ledger.totalIncome, 'border-emerald-100'],
              [t('totalExpense'), ledger.totalExpense, 'border-red-100'],
              [t('closing'), ledger.closingBalance, 'border-slate-200'],
            ].map(([label, val], i) => (
              <motion.div
                key={String(label)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`rounded-xl border bg-white p-4 shadow-sm ${label === t('totalIncome') ? 'bg-emerald-50/70' : ''} ${label === t('totalExpense') ? 'bg-red-50/70' : ''}`}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p
                  className={`mt-2 text-xl font-semibold tabular-nums ${label === t('totalIncome') ? 'text-emerald-800' : label === t('totalExpense') ? 'text-red-800' : ''}`}
                >
                  ₹ {fmtMoney(val)}
                </p>
                {label === t('closing') && (
                  <p className="mt-2 text-[11px] text-slate-500">
                    {t('closingHint')}
                  </p>
                )}
              </motion.div>
            ))}
          </section>

          {!locked && panel === null && (
            <div className="mx-auto mt-6 flex max-w-6xl flex-wrap gap-3 px-4">
              <button
                type="button"
                onClick={() => {
                  setEditingTx(null);
                  setPanel('ie');
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-4 text-sm font-medium text-emerald-800 shadow-sm hover:bg-emerald-50 sm:flex-none sm:justify-start"
              >
                <PlusCircle className="h-5 w-5" /> {t('addIE')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingTx(null);
                  setPanel('xfer');
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white px-4 py-4 text-sm font-medium text-sky-900 shadow-sm hover:bg-sky-50 sm:flex-none sm:justify-start"
              >
                <PlusCircle className="h-5 w-5" /> {t('transfer')}
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!locked && panel === 'ie' && (
              <motion.div
                key="ief"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mx-auto mt-6 max-w-2xl overflow-hidden px-4"
              >
                <TransactionForm
                  ledgerType="both"
                  dateKey={dateKey}
                  accounts={accounts}
                  categories={categories}
                  persons={persons}
                  onCancel={() => {
                    setPanel(null);
                    setEditingTx(null);
                  }}
                  onSubmit={async (payload, tid) => {
                    await onSubmitIe(payload, tid);
                  }}
                />
              </motion.div>
            )}
            {!locked && panel === 'xfer' && (
              <motion.div
                key="xf"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mx-auto mt-6 max-w-2xl overflow-hidden px-4"
              >
                <TransferForm
                  dateKey={dateKey}
                  accounts={accounts}
                  onCancel={() => {
                    setPanel(null);
                    setEditingTx(null);
                  }}
                  onSubmit={(payload, tid) => onSubmitXfer(payload, tid)}
                />
              </motion.div>
            )}
            {!locked &&
              panel === 'editIe' &&
              editingTx?.type !== 'transfer' && (
                <motion.div
                  key="ede"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mx-auto mt-6 max-w-2xl overflow-hidden px-4"
                >
                  <TransactionForm
                    ledgerType={editingTx.type}
                    dateKey={dateKey}
                    accounts={accounts}
                    categories={categories}
                    persons={persons}
                    initialTx={editingTx}
                    onCancel={() => {
                      setPanel(null);
                      setEditingTx(null);
                    }}
                    onSubmit={onSubmitIe}
                  />
                </motion.div>
              )}
            {!locked &&
              panel === 'editTransfer' &&
              editingTx?.type === 'transfer' && (
                <motion.div
                  key="edt"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mx-auto mt-6 max-w-2xl overflow-hidden px-4"
                >
                  <TransferForm
                    dateKey={dateKey}
                    accounts={accounts}
                    initialTx={editingTx}
                    onCancel={() => {
                      setPanel(null);
                      setEditingTx(null);
                    }}
                    onSubmit={onSubmitXfer}
                  />
                </motion.div>
              )}
          </AnimatePresence>

          <TransactionList
            expense={expenseList}
            income={incomeList}
            transfer={xferList}
            locked={locked}
            narrow={narrow}
            mobileTab={mobileTab}
            labels={{
              expense: t('expense'),
              income: t('income'),
              transfer: t('transfer'),
            }}
            onDelete={
              locked
                ? undefined
                : (tx) => {
                    setPendingDeleteTx(tx);
                  }
            }
            onEdit={
              locked
                ? undefined
                : (tx) => {
                    startEdit(tx);
                  }
            }
          />
        </>
      )}

      {!locked && (
        <div className="fixed bottom-20 right-4 z-40 lg:bottom-6">
          <button
            type="button"
            onClick={() => {
              setEditingTx(null);
              setPanel('ie');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/25 lg:hidden"
          >
            <PlusCircle className="h-5 w-5" /> {t('addTransaction')}
          </button>
        </div>
      )}
      {loading && ledger && (
        <div className="fixed bottom-4 left-4 flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> {t('refreshing')}
        </div>
      )}
    </div>
  );
}
