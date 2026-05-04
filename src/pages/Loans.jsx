import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import * as loanService from '../services/loanService.js';
import * as personService from '../services/personService.js';
import LoanForm from '../components/loans/LoanForm.jsx';
import LoanList from '../components/loans/LoanList.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function Loans() {
  const { t } = useLanguage();
  const [loans, setLoans] = useState([]);
  const [persons, setPersons] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [l, p, r] = await Promise.all([
        loanService.listLoans(),
        personService.getPersons(),
        loanService.getLoansReport(),
      ]);
      setLoans(l);
      setPersons(p.persons ?? []);
      setSummary(r);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(payload) {
    setSubmitting(true);
    try {
      if (editing) await loanService.updateLoan(editing._id, payload);
      else await loanService.createLoan(payload);
      setFormOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete loan record?')) return;
    try {
      await loanService.deleteLoan(id);
      await load();
    } catch (e) {
      setError(e.message || 'Delete failed');
    }
  }

  async function onPay(loan) {
    const amt = window.prompt('Payment amount');
    if (amt == null || amt === '') return;
    try {
      await loanService.addLoanPayment(loan._id, Number(amt));
      await load();
    } catch (e) {
      setError(e.message || 'Payment failed');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="rounded-lg p-2 hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold">{t('loans')}</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          >
            {t('addLoan')}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {error && (
          <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {summary && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Given Principal</p>
              <p className="text-xl font-bold tabular-nums text-slate-900">₹{summary.totalGivenPrincipal}</p>
              <p className="text-xs text-blue-600">+₹{summary.totalAccruedInterestGiven} interest</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Taken Principal</p>
              <p className="text-xl font-bold tabular-nums text-slate-900">₹{summary.totalTakenPrincipal}</p>
              <p className="text-xs text-amber-600">+₹{summary.totalAccruedInterestTaken} interest</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pending</p>
              <p className="text-xl font-bold tabular-nums text-emerald-700">₹{summary.totalPending}</p>
              <p className="text-xs text-slate-500">Principal + Interest</p>
            </div>
            <div className="rounded-xl border border-red-100 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overdue</p>
              <p className="text-xl font-bold tabular-nums text-red-700">{summary.overdueLoans?.length ?? 0}</p>
              <p className="text-xs text-slate-500">Loans past due date</p>
            </div>
          </div>
        )}
        {formOpen && (
          <LoanForm
            persons={persons}
            initial={editing}
            submitting={submitting}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
            onSubmit={onSubmit}
          />
        )}
        {loading ? (
          <Loader2 className="mx-auto block h-10 w-10 animate-spin text-slate-400" />
        ) : loans.length ? (
          <LoanList
            loans={loans}
            onEdit={(x) => {
              setEditing(x);
              setFormOpen(true);
            }}
            onDelete={onDelete}
            onPay={onPay}
          />
        ) : (
          <EmptyState title={t('noLoans')} />
        )}
      </main>
    </div>
  );
}
