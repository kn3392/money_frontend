import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import * as budgetService from '../services/budgetService.js';
import * as categoryService from '../services/categoryService.js';
import BudgetForm from '../components/budget/BudgetForm.jsx';
import BudgetList from '../components/budget/BudgetList.jsx';
import BudgetAlertCard from '../components/budget/BudgetAlertCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function Budget() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const now = new Date();
  const [reportMonth, setReportMonth] = useState(now.getMonth() + 1);
  const [reportYear, setReportYear] = useState(now.getFullYear());

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cats, bs, rep] = await Promise.all([
        categoryService.getCategories('expense'),
        budgetService.listBudgets(),
        budgetService.getBudgetReport(reportMonth, reportYear),
      ]);
      setCategories(cats);
      setBudgets(bs);
      setReport(rep);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [reportMonth, reportYear]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(payload) {
    setSubmitting(true);
    setNotice('');
    try {
      if (editing) {
        await budgetService.updateBudget(editing._id, {
          budgetAmount: payload.budgetAmount,
          alertAtPercent: payload.alertAtPercent,
        });
        setNotice('Budget updated.');
      } else {
        await budgetService.createBudget(payload);
        setNotice('Budget created.');
      }
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
    if (!window.confirm('Delete this budget?')) return;
    try {
      await budgetService.deleteBudget(id);
      setNotice('Deleted.');
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
            <Link
              to="/dashboard"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold text-slate-900">{t('budgets')}</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          >
            {t('addBudget')}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* Help Section */}
        <section className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-bold text-emerald-900">
            <AlertCircle className="h-4 w-4" /> {t('howToUseBudgets') || 'How to use Budgets'}
          </h2>
          <ul className="mt-2 list-inside list-disc text-xs space-y-1 text-emerald-800">
            <li>Set a limit for an expense category (e.g., "Food" limit of ₹5,000 per month).</li>
            <li>The system will track your expenses automatically for the selected month/year.</li>
            <li><strong>Alert Percentage:</strong> Get a warning when you reach a certain amount (e.g., 80% of your budget).</li>
            <li>Use the month/year selectors below to see your progress for different periods.</li>
          </ul>
        </section>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {notice && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {notice}
          </p>
        )}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">{t('budgetReport')}</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            <input
              type="number"
              min={1}
              max={12}
              value={reportMonth}
              onChange={(e) => setReportMonth(Number(e.target.value))}
              className="w-20 rounded border px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <input
              type="number"
              min={2000}
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
              className="w-24 rounded border px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : report?.lines?.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {report.lines.map((line) => (
                <BudgetAlertCard key={line.budget.id || line.budget._id} line={line} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No budgets found for this month.</p>
          )}
        </section>
        {formOpen && (
          <BudgetForm
            categories={categories}
            initial={editing}
            submitting={submitting}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
            onSubmit={onSubmit}
          />
        )}
        {loading && !budgets.length ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
          </div>
        ) : budgets.length ? (
          <BudgetList
            budgets={budgets}
            onEdit={(b) => {
              setEditing(b);
              setFormOpen(true);
            }}
            onDelete={onDelete}
          />
        ) : (
          <EmptyState title={t('noBudgets')} detail={t('noBudgetsHint')} />
        )}
      </main>
    </div>
  );
}
