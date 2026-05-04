import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive,
  busy,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
            onClick={() => !busy && onCancel?.()}
          />
          <div className="fixed inset-0 z-[101] flex items-end justify-center p-4 sm:items-center">
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <button
                type="button"
                className="absolute right-4 top-4 rounded-full p-1 text-slate-500 hover:bg-slate-100"
                onClick={() => !busy && onCancel?.()}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              {title && (
                <h2 className="pr-10 text-lg font-semibold text-slate-900">
                  {title}
                </h2>
              )}
              {message && (
                <p className="mt-3 text-sm text-slate-600">{message}</p>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={busy}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                  onClick={() => onCancel?.()}
                >
                  {cancelLabel ?? 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                    destructive
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                  onClick={() => onConfirm?.()}
                >
                  {confirmLabel ?? 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
