import { Pencil, Trash2 } from 'lucide-react';

export default function GoalProgressCard({ goal, extras, onAddSaving, onEdit, onDelete }) {
  const pct = extras?.progressPercent ?? 0;
  // Use goal.id if present, otherwise fallback to goal._id
  const gid = goal.id || goal._id;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">{goal.name}</h3>
          <p className="text-xs text-slate-500">{goal.status}</p>
        </div>
        <div className="flex gap-1">
          {goal.status === 'active' && onAddSaving && (
            <button
              type="button"
              onClick={() => onAddSaving(gid)}
              className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
            >
              Add saving
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(goal)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(gid)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-slate-600">
        ₹{goal.currentAmount} / ₹{goal.targetAmount} ({pct?.toFixed?.(1) ?? pct}%)
      </p>
      {extras?.expectedCompletionEstimate && (
        <p className="text-xs text-slate-500">
          Est. completion ~ {extras.expectedCompletionEstimate}
        </p>
      )}
    </div>
  );
}
