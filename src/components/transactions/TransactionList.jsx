import { Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { absoluteUploadUrl } from '../../services/uploadService.js';

function Money({ n }) {
  return (
    <span className="tabular-nums">
      ₹ {Number(n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
    </span>
  );
}

function TxRow({ tx, tone, onEdit, onDelete, disabled, index }) {
  const meta =
    tx.type === 'transfer' ? (
      <span className="text-xs text-slate-500">
        {tx.fromAccount?.name ?? '—'} → {tx.toAccount?.name ?? '—'}
      </span>
    ) : (
      <span className="text-xs text-slate-500">
        {[tx.category?.name, tx.account?.name].filter(Boolean).join(' · ')}
        {tx.person?.name ? ` · ${tx.person.name}` : ''}
      </span>
    );

  const hasAtt = Boolean(tx.attachmentUrl);
  const receiptHref =
    hasAtt && tx.attachmentUrl ? absoluteUploadUrl(tx.attachmentUrl) : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15, delay: index * 0.02 }}
      className={`rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm ${tone ?? ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Money n={tx.amount} />
          {tx.note && (
            <p className="mt-1 break-words font-medium text-slate-900">
              {tx.note}
            </p>
          )}
          <div className="mt-1">{meta}</div>
          {hasAtt && (
            <a
              href={receiptHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-[11px] text-emerald-700 underline"
            >
              Receipt
            </a>
          )}
        </div>
        {(onEdit || onDelete) && !disabled && (
          <div className="flex shrink-0 gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(tx)}
                className="rounded p-1.5 text-slate-600 hover:bg-slate-100"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(tx)}
                className="rounded p-1.5 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function TransactionList({
  expense = [],
  income = [],
  transfer = [],
  onEdit,
  onDelete,
  locked,
  narrow = false,
  mobileTab = 'expense',
  labels = { expense: 'Expense', income: 'Income', transfer: 'Transfer' },
}) {
  const lockedFlag = locked;
  const hideExp = narrow && mobileTab !== 'expense';
  const hideInc = narrow && mobileTab !== 'income';
  const hideTr = narrow && mobileTab !== 'transfer';

  return (
    <div className="mx-auto mt-8 grid max-w-6xl gap-6 lg:grid-cols-2">
      <section className={hideExp ? 'hidden lg:block' : ''}>
        <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-amber-800">
          {labels.expense}
        </h2>
        <div className="space-y-2">
          {expense.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
              —
            </p>
          )}
          {expense.map((tx, i) => (
            <TxRow
              key={tx.id}
              tx={tx}
              index={i}
              tone="border-l-4 border-l-amber-500"
              onEdit={onEdit}
              onDelete={onDelete}
              disabled={lockedFlag}
            />
          ))}
        </div>
      </section>
      <section className={hideInc ? 'hidden lg:block' : ''}>
        <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-emerald-800">
          {labels.income}
        </h2>
        <div className="space-y-2">
          {income.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
              —
            </p>
          )}
          {income.map((tx, i) => (
            <TxRow
              key={tx.id}
              tx={tx}
              index={i}
              tone="border-l-4 border-l-emerald-500"
              onEdit={onEdit}
              onDelete={onDelete}
              disabled={lockedFlag}
            />
          ))}
        </div>
      </section>
      <section
        className={`lg:col-span-2 ${hideTr ? 'hidden lg:block' : ''}`}
      >
        <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-slate-600">
          {labels.transfer}
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {transfer.length === 0 && (
            <p className="sm:col-span-2 rounded-lg border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
              —
            </p>
          )}
          {transfer.map((tx, i) => (
            <TxRow
              key={tx.id}
              tx={tx}
              index={i}
              tone="border-l-4 border-l-sky-500"
              onEdit={onEdit}
              onDelete={onDelete}
              disabled={lockedFlag}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
