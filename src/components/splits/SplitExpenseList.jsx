import { useLanguage } from '../../context/LanguageContext.jsx';

export default function SplitExpenseList({ splits, onSettle }) {
  const { t } = useLanguage();
  if (!splits?.length) return null;
  return (
    <ul className="space-y-4">
      {splits.map((s) => (
        <li key={s._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900">{s.title}</p>
              <p className="text-xs text-slate-500">
                ₹{s.totalAmount} · {s.splitType} · {s.status}
              </p>
            </div>
          </div>
          <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm">
            {(s.participants ?? []).map((p) => (
              <li key={p._id} className="flex flex-wrap items-center justify-between gap-2">
                <span>{p.personId?.name ?? '—'}</span>
                <span className="tabular-nums text-slate-700">
                  share ₹{p.shareAmount} · paid ₹{p.paidAmount} · {p.status}
                </span>
                {s.status === 'active' && p.status !== 'settled' && (
                  <button
                    type="button"
                    onClick={() => onSettle(s._id, p._id)}
                    className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800"
                  >
                    {t('confirm')} settle
                  </button>
                )}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
