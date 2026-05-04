import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import * as goalService from '../services/goalService.js';
import * as accountService from '../services/accountService.js';
import GoalForm from '../components/goals/GoalForm.jsx';
import GoalProgressCard from '../components/goals/GoalProgressCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function SavingsGoals() {
  const { t } = useLanguage();
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [g, acc, rep] = await Promise.all([
        goalService.listGoals(),
        accountService.getAccounts(),
        goalService.getGoalsReport(),
      ]);
      setGoals(g);
      setAccounts(acc);
      setReport(rep);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const extrasById = Object.fromEntries(
    (report?.goals ?? []).map((x) => [x._id, x])
  );

  async function onSubmit(payload) {
    setSubmitting(true);
    try {
      if (editing) await goalService.updateGoal(editing._id, payload);
      else await goalService.createGoal(payload);
      setNotice(t('saved'));
      setFormOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function onAddSaving(id) {
    const amt = window.prompt('Amount to add');
    if (amt == null || amt === '') return;
    try {
      await goalService.addSaving(id, Number(amt));
      await load();
    } catch (e) {
      setError(e.message || 'Failed');
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await goalService.deleteGoal(id);
      setNotice('Goal deleted.');
      await load();
    } catch (e) {
      setError(e.message || 'Delete failed');
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
            <h1 className="text-lg font-semibold">{t('savingsGoals')}</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          >
            {t('addGoal')}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* Help Section */}
        <section className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-blue-900">
            <AlertCircle className="h-4 w-4" /> How to use Savings Goals
          </h2>
          <ul className="mt-2 list-inside list-disc text-xs space-y-1 text-blue-800">
            <li>Create a goal for something you want to buy or save for.</li>
            <li>Click <strong>"Add saving"</strong> to record money you've set aside for this goal.</li>
            <li>The progress bar shows how close you are to reaching your target.</li>
            <li>Once you reach 100%, the goal will be marked as completed!</li>
          </ul>
        </section>

        {error && (
          <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {notice && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
            {notice}
          </p>
        )}
        {formOpen && (
          <GoalForm
            accounts={accounts}
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
        ) : goals.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {goals.map((g) => (
              <GoalProgressCard
                key={g.id || g._id}
                goal={g}
                extras={extrasById[g.id || g._id]}
                onAddSaving={onAddSaving}
                onEdit={(goal) => {
                  setEditing(goal);
                  setFormOpen(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyState title={t('noGoals')} />
        )}
      </main>
    </div>
  );
}
