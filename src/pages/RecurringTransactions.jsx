import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2,
  Plus,
  CalendarClock,
  Play,
  Trash2,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wallet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as recur from '../services/recurringApi.js';
import * as accountService from '../services/accountService.js';
import * as categoryService from '../services/categoryService.js';
import * as personService from '../services/personService.js';
import { useToast } from '../context/ToastContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';

export default function RecurringTransactions() {
  const { push } = useToast();
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [running, setRunning] = useState(false);

  // Metadata
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    nextRunDate: '',
    note: '',
    accountId: '',
    categoryId: '',
    fromAccountId: '',
    toAccountId: '',
    personId: '',
    endDate: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const [recurData, accs, cats, pdata] = await Promise.all([
        recur.listRecurring(),
        accountService.getAccounts(),
        categoryService.getCategories(),
        personService.getPersons(),
      ]);
      setItems(recurData.recurring ?? []);
      setAccounts(accs);
      setCategories(cats);
      setPersons(pdata?.persons ?? []);
    } catch (e) {
      setErr(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
      setLoadingMeta(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSubmit(e) {
    e.preventDefault();
    setRunning(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        startDate: form.startDate,
        nextRunDate: form.nextRunDate || form.startDate,
        note: form.note.trim(),
      };

      // Clean up irrelevant fields based on type
      if (form.type === 'transfer') {
        delete payload.accountId;
        delete payload.categoryId;
        delete payload.personId;
      } else {
        delete payload.fromAccountId;
        delete payload.toAccountId;
        if (!payload.personId) delete payload.personId;
      }
      if (!payload.endDate) delete payload.endDate;

      await recur.createRecurring(payload);
      push(t('saved') || 'Recurring rule saved');
      setShowForm(false);
      await loadData();
    } catch (e) {
      push(e.response?.data?.message || e.message, 'error');
    } finally {
      setRunning(false);
    }
  }

  async function handleDisable(id) {
    if (!window.confirm(t('confirm') + '?')) return;
    try {
      await recur.deleteRecurring(id);
      push(t('disabled') || 'Rule disabled');
      await loadData();
    } catch (e) {
      push(e.response?.data?.message || e.message, 'error');
    }
  }

  async function handleRunManual() {
    setRunning(true);
    try {
      await recur.runDueRecurring();
      push('Due recurring processed');
      await loadData();
    } catch (e) {
      push(e.response?.data?.message || e.message, 'error');
    } finally {
      setRunning(false);
    }
  }

  const dateFmt = (d) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '—';

  const filteredCats = categories.filter((c) => c.type === form.type);
  const activeAccounts = accounts.filter((a) => a.isActive !== false);

  const inputClass =
    'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/30 transition-all focus:border-emerald-500 focus:ring-2';

  if (loadingMeta && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{t('recurring')}</h1>
              <p className="text-xs text-slate-500">Automate your finances</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRunManual}
              disabled={running}
              title="Process due items now"
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              {running ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-emerald-300 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              {showForm ? t('cancel') : t('add')}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
              >
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Type
                    </label>
                    <select
                      className={inputClass}
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value, categoryId: '' })}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                      <option value="transfer">Transfer</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Frequency
                    </label>
                    <select
                      className={inputClass}
                      value={form.frequency}
                      onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Amount
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className={inputClass}
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                  </div>

                  {form.type === 'transfer' ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          From Account
                        </label>
                        <select
                          required
                          className={inputClass}
                          value={form.fromAccountId}
                          onChange={(e) => setForm({ ...form, fromAccountId: e.target.value })}
                        >
                          <option value="">Select</option>
                          {activeAccounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          To Account
                        </label>
                        <select
                          required
                          className={inputClass}
                          value={form.toAccountId}
                          onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}
                        >
                          <option value="">Select</option>
                          {activeAccounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Account
                        </label>
                        <select
                          required
                          className={inputClass}
                          value={form.accountId}
                          onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                        >
                          <option value="">Select Account</option>
                          {activeAccounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Category
                        </label>
                        <select
                          required
                          className={inputClass}
                          value={form.categoryId}
                          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                        >
                          <option value="">Select Category</option>
                          {filteredCats.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Person (Optional)
                        </label>
                        <select
                          className={inputClass}
                          value={form.personId}
                          onChange={(e) => setForm({ ...form, personId: e.target.value })}
                        >
                          <option value="">No Person</option>
                          {persons.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Start Date
                    </label>
                    <input
                      required
                      type="date"
                      className={inputClass}
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      className={inputClass}
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                  <div className="lg:col-span-3 space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Note
                    </label>
                    <input
                      placeholder="Salary, Rent, Netflix, etc."
                      className={inputClass}
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={running}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50"
                  >
                    {running && <Loader2 className="h-4 w-4 animate-spin" />}
                    {t('save')}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {err && <div className="mb-6"><ErrorState message={err} /></div>}

        {items.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 py-20">
            <EmptyState
              icon={CalendarClock}
              title="No Recurring Rules"
              detail="Set up automated entries for salary, rent, or subscriptions."
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 group-hover:bg-emerald-50 transition-colors">
                    <CalendarClock className="h-5 w-5 text-slate-600 group-hover:text-emerald-600" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDisable(r.id)}
                    className="rounded-lg p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${r.isActive === false ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      {r.frequency} · {r.type}
                    </p>
                  </div>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    ₹ {Number(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-1">
                    {r.note || 'No note provided'}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Next: {dateFmt(r.nextRunDate)}</span>
                  </div>
                  {r.isActive === false && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600">
                      Inactive
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
