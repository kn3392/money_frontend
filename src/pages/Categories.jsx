import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import * as categoryService from '../services/categoryService';

export default function Categories() {
  const [filter, setFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');

  const load = useCallback(
    async (options = { withSpinner: true }) => {
      const { withSpinner = true } = options;
      if (withSpinner) setLoading(true);
      setError('');
      try {
        const typeParam =
          filter === 'income'
            ? 'income'
            : filter === 'expense'
              ? 'expense'
              : undefined;
        const rows = await categoryService.getCategories(typeParam);
        setCategories(rows);
      } catch (e) {
        setError(
          e.response?.data?.message || e.message || 'Failed to load categories'
        );
      } finally {
        if (withSpinner) setLoading(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- CRUD fetch when filter changes
    void load();
  }, [load]);

  function resetForm() {
    setName('');
    setType('expense');
    setIcon('');
    setColor('');
    setEditing(null);
    setFormOpen(false);
  }

  function startEdit(cat) {
    setEditing(cat);
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon || '');
    setColor(cat.color || '');
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
      const payload = { name, type, icon, color };
      if (editing) {
        await categoryService.updateCategory(editing.id, payload);
        setNotice('Category updated.');
      } else {
        await categoryService.createCategory(payload);
        setNotice('Category created.');
      }
      resetForm();
      await load({ withSpinner: false });
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(cat) {
    if (!window.confirm(`Deactivate category "${cat.name}"?`)) return;
    setError('');
    try {
      await categoryService.deleteCategory(cat.id);
      setNotice('Category deactivated.');
      await load({ withSpinner: false });
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Delete failed');
    }
  }

  const incomeList = categories.filter((c) => c.type === 'income');
  const expenseList = categories.filter((c) => c.type === 'expense');

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/dashboard"
            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Categories
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Income and expense buckets for your ledger.
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
          Add category
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'income', 'expense'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
              filter === f
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
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

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-medium text-slate-900">
            {editing ? 'Edit category' : 'New category'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Type
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={Boolean(editing)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Icon key (optional)
              <input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g. coffee"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Color (optional)
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#0f766e"
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
              {editing ? 'Save' : 'Create'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {(filter === 'all' || filter === 'income') && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-800">
                <Tag className="h-4 w-4" />
                Income
              </h2>
              <ul className="space-y-2">
                {incomeList.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div>
                      <span className="font-medium text-slate-900">{c.name}</span>
                      {c.isDefault && (
                        <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="rounded p-2 text-slate-600 hover:bg-slate-100"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(c)}
                        className="rounded p-2 text-red-600 hover:bg-red-50"
                        aria-label="Deactivate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
                {incomeList.length === 0 && (
                  <li className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                    No income categories.
                  </li>
                )}
              </ul>
            </section>
          )}
          {(filter === 'all' || filter === 'expense') && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-800">
                <Tag className="h-4 w-4" />
                Expense
              </h2>
              <ul className="space-y-2">
                {expenseList.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div>
                      <span className="font-medium text-slate-900">{c.name}</span>
                      {c.isDefault && (
                        <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="rounded p-2 text-slate-600 hover:bg-slate-100"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(c)}
                        className="rounded p-2 text-red-600 hover:bg-red-50"
                        aria-label="Deactivate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
                {expenseList.length === 0 && (
                  <li className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                    No expense categories.
                  </li>
                )}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
