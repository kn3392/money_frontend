import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function SplitExpenseForm({ accounts, persons, onSubmit, onCancel, submitting }) {
  const { t } = useLanguage();
  const [splitType, setSplitType] = useState('equal');
  const [selectedPersons, setSelectedPersons] = useState([]);

  function togglePerson(id) {
    setSelectedPersons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const totalAmount = Number(fd.get('totalAmount'));
        const participants =
          splitType === 'equal'
            ? selectedPersons.map((personId) => ({ personId }))
            : selectedPersons.map((personId) => ({
                personId,
                shareAmount: Number(fd.get(`share_${personId}`) || 0),
              }));
        onSubmit({
          title: fd.get('title'),
          totalAmount,
          payerAccountId: fd.get('payerAccountId'),
          splitType,
          participants,
          date: fd.get('date') || undefined,
          note: fd.get('note') || '',
        });
      }}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700">Title</label>
        <input
          name="title"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">{t('amount')} total</label>
        <input
          name="totalAmount"
          type="number"
          min={0.01}
          step="0.01"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Payer account</label>
        <select
          name="payerAccountId"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {accounts.map((a) => (
            <option key={a.id ?? a._id} value={a.id ?? a._id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Split</label>
        <select
          value={splitType}
          onChange={(e) => setSplitType(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="equal">Equal</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700">{t('person')}s</p>
        <div className="mt-2 flex max-h-40 flex-col gap-2 overflow-y-auto rounded-lg border border-slate-200 p-2">
          {persons.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedPersons.includes(p.id)}
                onChange={() => togglePerson(p.id)}
              />
              {p.name}
              {splitType === 'custom' && selectedPersons.includes(p.id) && (
                <input
                  name={`share_${p.id}`}
                  type="number"
                  min={0.01}
                  step="0.01"
                  placeholder="Share"
                  className="ml-auto w-28 rounded border px-2 py-1"
                />
              )}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Date</label>
        <input
          name="date"
          type="date"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Note</label>
        <textarea name="note" rows={2} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || selectedPersons.length === 0}
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
