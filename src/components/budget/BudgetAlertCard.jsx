export default function BudgetAlertCard({ line }) {
  if (!line) return null;
  const { alertStatus, usagePercent, budgetAmount, actualExpense, remainingBudget } = line;
  const tone =
    alertStatus === 'crossed'
      ? 'border-red-200 bg-red-50'
      : alertStatus === 'warning'
        ? 'border-amber-200 bg-amber-50'
        : 'border-emerald-200 bg-emerald-50';
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${tone}`}>
      <p className="text-sm font-semibold text-slate-900">
        {line.budget?.categoryId?.name ?? 'Category'}
      </p>
      <p className="mt-1 text-xs text-slate-600">
        Usage {usagePercent?.toFixed?.(1) ?? usagePercent}% · Budget ₹{budgetAmount} · Spent ₹
        {actualExpense}
      </p>
      <p className="mt-1 text-xs font-medium capitalize">{alertStatus}</p>
      <p className="text-xs text-slate-600">Remaining ₹{remainingBudget}</p>
    </div>
  );
}
