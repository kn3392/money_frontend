import { Pencil, Trash2, IndianRupee } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function LoanList({ loans, onEdit, onDelete, onPay }) {
  const { t } = useLanguage();
  if (!loans?.length) return null;
  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
      {loans.map((l) => (
        <li key={l._id} className="px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-slate-900">{l.personId?.name ?? '—'}</p>
              <p className="text-xs text-slate-500">
                {l.interestType !== 'none'
                  ? `${l.interestRate}% ${l.interestType} (${l.interestFrequency})`
                  : 'No interest'}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm tabular-nums text-slate-800">
                <p>Principal: ₹{l.principalAmount}</p>
                <p className="text-amber-700">Interest: +₹{l.accruedInterest}</p>
                <p className="font-bold">Total: ₹{l.totalDue}</p>
              </div>
              <p className="text-xs font-medium text-emerald-800">
                Paid: ₹{l.paidAmount} · Remaining: ₹{l.remainingAmount}
              </p>
            </div>
            <div className="flex gap-1">
              {l.status !== 'completed' && (
                <button
                  type="button"
                  onClick={() => onPay(l)}
                  className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50"
                  title="Payment"
                >
                  <IndianRupee className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onEdit(l)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                aria-label={t('edit')}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(l.id || l._id)}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                aria-label={t('delete')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
