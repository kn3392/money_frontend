import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import * as accountService from '../services/accountService';

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'person', label: 'Person' },
  { value: 'other', label: 'Other' },
];

function formatMoney(n) {
  return Number(n ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function moneyClass(n) {
  return Number(n ?? 0) < 0 ? 'text-red-700' : 'text-slate-900';
}

export default function Accounts() {
  const { t } = useLanguage();
  const [summaryRows, setSummaryRows] = useState([]);
  const [cashFlow, setCashFlow] = useState(null);
  const [hasNegative, setHasNegative] = useState(false);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState('cash');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [description, setDescription] = useState('');

  async function load(options = { withSpinner: true }) {
    const { withSpinner = true } = options;
    if (withSpinner) setLoading(true);
    setError('');
    try {
      const data = await accountService.getAccountSummary();
      setSummaryRows(data.summary ?? []);
      setCashFlow(data.cashFlow ?? null);
      setHasNegative(Boolean(data.hasNegativeBalance));
      setTotalAvailable(Number(data.totalAvailableBalance ?? 0));
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load accounts');
    } finally {
      if (withSpinner) setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setName('');
    setType('cash');
    setOpeningBalance('0');
    setDescription('');
    setEditing(null);
    setFormOpen(false);
  }

  function startEdit(acc) {
    setEditing(acc);
    setName(acc.name);
    setType(acc.type);
    setOpeningBalance(String(acc.openingBalance ?? 0));
    setDescription(acc.description ?? '');
    setFormOpen(true);
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setNotice('');
    setError('');
    try {
      const payload = {
        name,
        type,
        openingBalance: parseFloat(openingBalance) || 0,
        description,
      };
      if (editing) {
        await accountService.updateAccount(editing.id, payload);
        setNotice(t('accountUpdated'));
      } else {
        await accountService.createAccount(payload);
        setNotice(t('accountCreated'));
      }
      resetForm();
      await load({ withSpinner: false });
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(acc) {
    if (
      !window.confirm(
        `Deactivate account "${acc.name}"? You can recreate it later with a new name if needed.`
      )
    )
      return;
    setError('');
    try {
      await accountService.deleteAccount(acc.id);
      setNotice(t('accountDeactivated'));
      await load({ withSpinner: false });
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Delete failed');
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/dashboard"
            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('dashboard')}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t('accounts')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t('accountsSubtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setFormOpen(true);
            setNotice('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          {t('addAccount')}
        </button>
      </div>

      {notice && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {hasNegative && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">{t('negativeBalance')}</p>
            <p className="mt-0.5">{t('negativeBalanceHint')}</p>
          </div>
        </div>
      )}

      {!loading && summaryRows.length > 0 && cashFlow && (
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">{t('cashFlowSummary')}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">{t('portfolioOpening')}</p>
              <p className={`text-lg font-semibold tabular-nums ${moneyClass(cashFlow.openingBalanceTotal)}`}>
                ₹ {formatMoney(cashFlow.openingBalanceTotal)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('totalIncome')}</p>
              <p className="text-lg font-semibold tabular-nums text-emerald-700">
                ₹ {formatMoney(cashFlow.totalIncome)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('totalExpense')}</p>
              <p className="text-lg font-semibold tabular-nums text-red-600">
                ₹ {formatMoney(cashFlow.totalExpense)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('portfolioClosing')}</p>
              <p className={`text-lg font-semibold tabular-nums ${moneyClass(cashFlow.closingBalanceTotal)}`}>
                ₹ {formatMoney(cashFlow.closingBalanceTotal)}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-700">
            {t('totalAvailable')}:{' '}
            <span className="tabular-nums text-emerald-700">₹ {formatMoney(totalAvailable)}</span>
          </p>
        </section>
      )}

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-medium text-slate-900">
            {editing ? t('editAccount') : t('newAccount')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              {t('accountName')}
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              {t('accountType')}
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {ACCOUNT_TYPES.map((ty) => (
                  <option key={ty.value} value={ty.value}>
                    {ty.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              {t('opening')}
              <input
                type="number"
                step="0.01"
                min="0"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              {t('accountDescription')}
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? t('saveChanges') : t('create')}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : summaryRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <Wallet className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-4 font-medium text-slate-900">{t('noAccountsYet')}</p>
          <p className="mt-1 text-sm text-slate-600">
            {t('noAccountsHint')}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {summaryRows.map((a) => (
            <li
              key={a.id}
              className={`rounded-xl border bg-white p-5 shadow-sm ${
                a.currentBalance < 0 ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Wallet className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-slate-900">{a.name}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      Type: {a.type}
                    </span>
                    {a.isDefault && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800">
                        {t('default')}
                      </span>
                    )}
                    {a.currentBalance < 0 && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                        {t('negativeBalance')}
                      </span>
                    )}
                  </div>
                  {a.description && (
                    <p className="mt-1 text-sm text-slate-600">{a.description}</p>
                  )}
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <dt className="text-xs font-medium text-slate-500">
                        {t('openingBalanceLabel')}
                      </dt>
                      <dd className="mt-1 text-base font-semibold tabular-nums text-slate-900">
                        ₹ {formatMoney(a.openingBalance)}
                      </dd>
                    </div>
                    <div className="rounded-lg bg-emerald-50/50 px-3 py-2">
                      <dt className="text-xs font-medium text-emerald-800">
                        {t('currentBalanceLabel')}
                      </dt>
                      <dd
                        className={`mt-1 text-base font-semibold tabular-nums ${moneyClass(a.currentBalance)}`}
                      >
                        ₹ {formatMoney(a.currentBalance)}
                      </dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <dt className="text-xs font-medium text-slate-500">{t('totalIncome')}</dt>
                      <dd className="mt-1 text-sm font-semibold tabular-nums text-emerald-700">
                        ₹ {formatMoney(a.totalIncome)}
                      </dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <dt className="text-xs font-medium text-slate-500">{t('totalExpense')}</dt>
                      <dd className="mt-1 text-sm font-semibold tabular-nums text-red-600">
                        ₹ {formatMoney(a.totalExpense)}
                      </dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <dt className="text-xs font-medium text-slate-500">{t('transferIn')}</dt>
                      <dd className="mt-1 text-sm font-semibold tabular-nums text-slate-800">
                        ₹ {formatMoney(a.totalTransferIn)}
                      </dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <dt className="text-xs font-medium text-slate-500">{t('transferOut')}</dt>
                      <dd className="mt-1 text-sm font-semibold tabular-nums text-slate-800">
                        ₹ {formatMoney(a.totalTransferOut)}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-slate-200 px-3 py-2 sm:col-span-2 lg:col-span-3">
                      <dt className="text-xs font-medium text-slate-500">{t('netMovement')}</dt>
                      <dd
                        className={`mt-1 text-sm font-semibold tabular-nums ${moneyClass(a.netMovement)}`}
                      >
                        ₹ {formatMoney(a.netMovement)}
                      </dd>
                      <p className="mt-1 text-[11px] leading-snug text-slate-500">{t('netMovementHint')}</p>
                    </div>
                  </dl>
                </div>
                <div className="flex shrink-0 gap-2 sm:flex-col">
                  <button
                    type="button"
                    onClick={() => startEdit(a)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="h-4 w-4" />
                    {t('edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(a)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('disable')}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
