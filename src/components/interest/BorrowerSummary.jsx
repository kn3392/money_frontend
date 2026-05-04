import React from 'react';
import { User, LayoutDashboard, IndianRupee } from 'lucide-react';

export default function BorrowerSummary({ summaries }) {
  if (!summaries?.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaries.map((s, i) => (
        <div key={i} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{s.borrowerName}</h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <LayoutDashboard className="h-3 w-3" />
                  {s.loanCount} {s.loanCount === 1 ? 'Loan' : 'Loans'}
                </div>
              </div>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter ${
              s.status === 'overdue' ? 'bg-rose-100 text-rose-700' : 
              s.status === 'closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {s.status}
            </span>
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Total Principal</span>
              <span className="font-bold text-slate-900">₹ {s.totalPrincipal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Interest (Pending)</span>
              <span className="font-bold text-emerald-600">₹ {s.totalPendingInterest.toLocaleString('en-IN')}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-50 pt-2 text-sm font-black text-rose-600">
              <span>NET BALANCE</span>
              <span>₹ {s.totalBalance.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-slate-50 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      ))}
    </div>
  );
}
