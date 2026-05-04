import { useLanguage } from '../../context/LanguageContext.jsx';

export default function GoalForm({ accounts, initial, onSubmit, onCancel, submitting }) {
  const { t } = useLanguage();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const linked = fd.get('linkedAccountId');
        onSubmit({
          name: fd.get('name'),
          targetAmount: Number(fd.get('targetAmount')),
          deadline: fd.get('deadline') || null,
          linkedAccountId: linked || null,
          status: fd.get('status') || 'active',
        });
      }}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700">Name</label>
        <input
          name="name"
          required
          defaultValue={initial?.name ?? ''}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">{t('amount')} target</label>
        <input
          name="targetAmount"
          type="number"
          min={0.01}
          step="0.01"
          required
          defaultValue={initial?.targetAmount ?? ''}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Deadline</label>
        <input
          name="deadline"
          type="date"
          defaultValue={
            initial?.deadline ? String(initial.deadline).slice(0, 10) : ''
          }
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Linked account</label>
        <select
          name="linkedAccountId"
          defaultValue={initial?.linkedAccountId?._id ?? initial?.linkedAccountId ?? ''}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">—</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Status</label>
        <select
          name="status"
          defaultValue={initial?.status ?? 'active'}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="active">active</option>
          <option value="paused">paused</option>
          <option value="cancelled">cancelled</option>
          <option value="completed">completed</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {t('save')}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm">
            {t('cancel')}
          </button>
        )}
      </div>
    </form>
  );
}
