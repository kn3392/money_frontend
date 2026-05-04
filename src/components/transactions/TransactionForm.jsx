import { useState } from 'react';
import { Loader2, Paperclip } from 'lucide-react';
import { uploadReceipt, absoluteUploadUrl } from '../../services/uploadService.js';

export default function TransactionForm({
  ledgerType,
  dateKey,
  accounts,
  categories,
  persons,
  onSubmit,
  onCancel,
  initialTx,
}) {
  const editing = Boolean(initialTx);
  const defaultType =
    ledgerType === 'both' ? 'expense' : ledgerType === 'expense' ? 'expense' : 'income';

  const [type, setType] = useState(initialTx?.type ?? defaultType);
  const [amount, setAmount] = useState(
    initialTx?.amount !== undefined ? String(initialTx.amount) : ''
  );
  const [accountId, setAccountId] = useState(() => {
    const a = initialTx?.account;
    if (!a) return initialTx?.accountId?._id ?? initialTx?.accountId ?? '';
    return a._id ? String(a._id) : '';
  });
  const [categoryId, setCategoryId] = useState(() => {
    const c = initialTx?.category;
    if (!c) return initialTx?.categoryId?._id ?? initialTx?.categoryId ?? '';
    return c._id ? String(c._id) : '';
  });
  const [personId, setPersonId] = useState(() => {
    const p = initialTx?.person;
    if (!p) return initialTx?.personId?._id ?? initialTx?.personId ?? '';
    return p._id ? String(p._id) : '';
  });
  const [note, setNote] = useState(initialTx?.note ?? '');
  const [attachmentUrl, setAttachmentUrl] = useState(
    initialTx?.attachmentUrl ?? ''
  );

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const activeAccounts = accounts.filter((a) => a.isActive !== false);
  const cats = categories.filter((c) => c.type === type);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const payload = {
        type,
        amount: Number(amount),
        date: dateKey,
        accountId,
        categoryId,
        personId: personId || undefined,
        note,
        attachmentUrl: attachmentUrl || undefined,
      };
      await onSubmit(payload, initialTx?.id);
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function onPickReceipt(ev) {
    const f = ev.target.files?.[0];
    if (!f) return;
    try {
      setBusy(true);
      const res = await uploadReceipt(f);
      if (res?.url) setAttachmentUrl(res.url);
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.message || 'Upload failed');
    } finally {
      setBusy(false);
      ev.target.value = '';
    }
  }

  const preview = attachmentUrl ? absoluteUploadUrl(attachmentUrl) : '';

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      {!editing && ledgerType === 'both' && (
        <div className="mb-4 flex gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="tt"
              checked={type === 'income'}
              onChange={() => setType('income')}
            />
            Income
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="tt"
              checked={type === 'expense'}
              onChange={() => setType('expense')}
            />
            Expense
          </label>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Amount
          <input
            required
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Account
          <select
            required
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Select</option>
            {activeAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Category ({type})
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Select</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Person (optional)
          <select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">—</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Note · supports Gujarati and other Unicode
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50/90 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">
            <Paperclip className="mb-1 inline-block h-4 w-4 align-text-bottom" />{' '}
            Receipt · image or pdf · max 5MB
          </p>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => void onPickReceipt(e)}
            className="mt-2 block text-sm text-slate-700"
          />
          {preview && (
            <div className="mt-2 text-xs">
              <a
                href={preview}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-700 underline"
              >
                Open uploaded file
              </a>
              <button
                type="button"
                className="ml-3 text-red-700"
                onClick={() => setAttachmentUrl('')}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {editing ? 'Save' : 'Add'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
