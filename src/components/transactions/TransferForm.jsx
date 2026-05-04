import { useState } from 'react';
import { Loader2, Paperclip } from 'lucide-react';
import { uploadReceipt, absoluteUploadUrl } from '../../services/uploadService.js';

export default function TransferForm({
  dateKey,
  accounts,
  onSubmit,
  onCancel,
  initialTx,
}) {
  const editing = Boolean(initialTx);
  const activeAccounts = accounts.filter((a) => a.isActive !== false);

  const [amount, setAmount] = useState(
    initialTx?.amount !== undefined ? String(initialTx.amount) : ''
  );
  const [fromAccountId, setFromAccountId] = useState(() => {
    const a = initialTx?.fromAccount;
    if (!a) return initialTx?.fromAccountId?._id ?? initialTx?.fromAccountId ?? '';
    return a._id ? String(a._id) : '';
  });
  const [toAccountId, setToAccountId] = useState(() => {
    const a = initialTx?.toAccount;
    if (!a) return initialTx?.toAccountId?._id ?? initialTx?.toAccountId ?? '';
    return a._id ? String(a._id) : '';
  });
  const [note, setNote] = useState(initialTx?.note ?? '');
  const [attachmentUrl, setAttachmentUrl] = useState(
    initialTx?.attachmentUrl ?? ''
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await onSubmit(
        {
          type: 'transfer',
          amount: Number(amount),
          date: dateKey,
          fromAccountId,
          toAccountId,
          note,
          attachmentUrl: attachmentUrl || undefined,
        },
        initialTx?.id
      );
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
      <p className="mb-4 text-xs text-slate-500">
        Moves money between accounts. Does not affect net closing for the day.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Amount
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <div className="sm:col-span-2" />
        <label className="text-sm font-medium text-slate-700">
          From
          <select
            required
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
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
        <label className="text-sm font-medium text-slate-700">
          To
          <select
            required
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
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
          Note · Gujarati Unicode OK
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50/90 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">
            <Paperclip className="mb-1 inline-block h-4 w-4 align-text-bottom" />{' '}
            Receipt (optional)
          </p>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => void onPickReceipt(e)}
            className="mt-2 block text-sm"
          />
          {preview && (
            <div className="mt-2 text-xs">
              <a
                href={preview}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 underline"
              >
                View file
              </a>{' '}
              <button
                type="button"
                className="text-red-700"
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
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {editing ? 'Save transfer' : 'Add transfer'}
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
