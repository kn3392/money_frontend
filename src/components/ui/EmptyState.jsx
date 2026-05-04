import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, detail, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center text-slate-600"
    >
      {Icon && (
        <Icon className="mx-auto mb-3 h-10 w-10 text-slate-400 opacity-70" />
      )}
      <p className="font-medium text-slate-900">{title}</p>
      {detail && <p className="mt-2 text-sm">{detail}</p>}
      {children && <div className="mt-4">{children}</div>}
    </motion.div>
  );
}
