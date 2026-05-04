import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ items }) {
  return (
    <div className="pointer-events-none fixed bottom-20 left-4 right-4 z-[120] mx-auto flex max-w-sm flex-col gap-2 sm:left-auto sm:right-4 md:bottom-4">
      <AnimatePresence mode="sync">
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`pointer-events-auto flex items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg ${
              t.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-emerald-200 bg-white text-emerald-900'
            }`}
          >
            {t.type === 'error' ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span className="whitespace-pre-wrap break-words">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
