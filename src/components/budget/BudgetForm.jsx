import { useLanguage } from '../../context/LanguageContext.jsx';

export default function BudgetForm({
  categories,
  initial,
  onSubmit,
  onCancel,
  submitting,
}) {
  const { t } = useLanguage();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onSubmit({
          categoryId: fd.get('categoryId'),
          month: Number(fd.get('month')),
          year: Number(fd.get('year')),
          budgetAmount: Number(fd.get('budgetAmount')),
          alertAtPercent: fd.get('alertAtPercent')
            ? Number(fd.get('alertAtPercent'))
            : 80,
        });
      }}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700">{t('category')}</label>
        <select
          name="categoryId"
          required
          defaultValue={initial?.categoryId?._id ?? initial?.categoryId ?? ''}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {!initial && <option value="">—</option>}
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Month</label>
          <input
            type="number"
            name="month"
            min={1}
            max={12}
            required
            defaultValue={initial?.month ?? new Date().getMonth() + 1}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Year</label>
          <input
            type="number"
            name="year"
            min={2000}
            required
            defaultValue={initial?.year ?? new Date().getFullYear()}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">{t('amount')}</label>
        <input
          type="number"
          name="budgetAmount"
          min={0.01}
          step="0.01"
          required
          defaultValue={initial?.budgetAmount ?? ''}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Alert at %</label>
        <input
          type="number"
          name="alertAtPercent"
          min={1}
          max={100}
          defaultValue={initial?.alertAtPercent ?? 80}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {t('save')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-800"
          >
            {t('cancel')}
          </button>
        )}
      </div>
    </form>
  );
}
