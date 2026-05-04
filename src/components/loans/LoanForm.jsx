import { useLanguage } from '../../context/LanguageContext.jsx';

export default function LoanForm({ persons, initial, onSubmit, onCancel, submitting }) {
  const { t } = useLanguage();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onSubmit({
          personId: fd.get('personId'),
          type: fd.get('type'),
          principalAmount: Number(fd.get('principalAmount')),
          interestRate: Number(fd.get('interestRate') ?? 0),
          interestType: fd.get('interestType'),
          interestFrequency: fd.get('interestFrequency'),
          compoundingFrequency: fd.get('compoundingFrequency'),
          startDate: fd.get('startDate'),
          dueDate: fd.get('dueDate') || null,
          reminderDate: fd.get('reminderDate') || null,
          note: fd.get('note') || '',
        });
      }}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700">{t('person')}</label>
        <select
          name="personId"
          required
          defaultValue={initial?.personId?._id ?? initial?.personId ?? ''}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {persons.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Type</label>
        <select
          name="type"
          required
          defaultValue={initial?.type ?? 'given'}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="given">Given (you lent)</option>
          <option value="taken">Taken (you borrowed)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Principal Amount</label>
        <input
          name="principalAmount"
          type="number"
          min={0.01}
          step="0.01"
          required
          defaultValue={initial?.principalAmount ?? ''}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Interest Rate (%)</label>
          <input
            name="interestRate"
            type="number"
            step="0.1"
            defaultValue={initial?.interestRate ?? 0}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Interest Type</label>
          <select
            name="interestType"
            defaultValue={initial?.interestType ?? 'none'}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="none">None</option>
            <option value="simple">Simple</option>
            <option value="compound">Compound</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Interest Frequency</label>
          <select
            name="interestFrequency"
            defaultValue={initial?.interestFrequency ?? 'monthly'}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Compounding</label>
          <select
            name="compoundingFrequency"
            defaultValue={initial?.compoundingFrequency ?? 'monthly'}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="half-yearly">Half-Yearly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Start Date</label>
          <input
            name="startDate"
            type="date"
            required
            defaultValue={initial?.startDate ? String(initial.startDate).slice(0, 10) : new Date().toISOString().slice(0, 10)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Due Date</label>
          <input
            name="dueDate"
            type="date"
            defaultValue={initial?.dueDate ? String(initial.dueDate).slice(0, 10) : ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Reminder</label>
          <input
            name="reminderDate"
            type="date"
            defaultValue={initial?.reminderDate ? String(initial.reminderDate).slice(0, 10) : ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Note</label>
        <textarea
          name="note"
          rows={2}
          placeholder="Purpose, terms, etc."
          defaultValue={initial?.note ?? ''}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
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
