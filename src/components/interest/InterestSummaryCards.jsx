import React from 'react';
import { IndianRupee, Users, NotebookText, CheckCircle, Calendar, AlertTriangle } from 'lucide-react';

export default function InterestSummaryCards({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      title: 'Total Principal',
      value: `₹ ${summary.totalPrincipal?.toLocaleString('en-IN')}`,
      icon: <IndianRupee className="h-5 w-5 text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      title: 'Pending Interest',
      value: `₹ ${(summary.totalPendingInterest || 0).toLocaleString('en-IN')}`,
      icon: <NotebookText className="h-5 w-5 text-emerald-600" />,
      bg: 'bg-emerald-50',
    },
    {
      title: 'Total Received',
      value: `₹ ${summary.totalReceived?.toLocaleString('en-IN')}`,
      icon: <CheckCircle className="h-5 w-5 text-indigo-600" />,
      bg: 'bg-indigo-50',
    },
    {
      title: 'Total Balance',
      value: `₹ ${summary.totalBalance?.toLocaleString('en-IN')}`,
      icon: <AlertTriangle className="h-5 w-5 text-rose-600" />,
      bg: 'bg-rose-50',
    },
    {
      title: 'Unique Borrowers',
      value: summary.uniqueBorrowers,
      icon: <Users className="h-5 w-5 text-slate-600" />,
      bg: 'bg-slate-50',
    },
    {
      title: 'Active Loans',
      value: summary.active + (summary.partial || 0),
      icon: <Calendar className="h-5 w-5 text-amber-600" />,
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, i) => (
        <div key={i} className={`rounded-2xl border border-slate-100 p-4 shadow-sm transition-all hover:shadow-md ${card.bg}`}>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-2 shadow-sm">{card.icon}</div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{card.title}</p>
              <p className="text-sm font-bold text-slate-900">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
