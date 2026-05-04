import { Pencil, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function BudgetList({ budgets, onEdit, onDelete }) {
  const { t } = useLanguage();
  if (!budgets?.length) return null;
  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
      {budgets.map((b) => {
        const bid = b.id || b._id;
        return (
          <li key={bid} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium text-slate-900">{b.categoryId?.name ?? '—'}</p>
              <p className="text-xs text-slate-500">
                {b.month}/{b.year} · ₹{b.budgetAmount} · alert {b.alertAtPercent ?? 80}%
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(b)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                aria-label={t('edit')}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(bid)}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                aria-label={t('delete')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
