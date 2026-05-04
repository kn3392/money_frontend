import { Pencil, Trash2, Calendar, User, ArrowRight, HandCoins, Clock, ArrowDownCircle } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

export default function InterestLoanTable({ loans, onEdit, onDelete, onReceive, onReturnPrincipal, onViewHistory }) {
  if (!loans?.length) return null;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'done': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'due': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'partial_paid': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'ACTIVE';
      case 'done': return 'DONE';
      case 'due': return 'DUE';
      case 'partial_paid': return 'PARTIAL';
      default: return status?.toUpperCase();
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <tr>
              <th className="px-6 py-4">Borrower</th>
              <th className="px-6 py-4">Loan Details</th>
              <th className="px-6 py-4 text-right">Interest</th>
              <th className="px-6 py-4 text-right">Total Due</th>
              <th className="px-6 py-4 text-right">Balance</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loans.map((loan) => (
              <tr key={loan._id} className="group transition-colors hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{loan.borrowerName}</p>
                      <p className="text-[10px] text-slate-500">{loan.contactDetails || 'No contact'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-slate-700">₹ {loan.principalAmount?.toLocaleString('en-IN')}</p>
                    <p className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {formatDate(loan.startDate)}
                      {loan.endDate && (
                        <>
                          <ArrowRight className="h-2 w-2" />
                          <span className="font-bold text-slate-700">{formatDate(loan.endDate)}</span>
                        </>
                      )}
                      <span className="ml-1 opacity-50">
                        ({loan.manualMonths ? `${loan.manualMonths} months` : `${loan.monthsUsed} months used`})
                      </span>
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="font-bold text-emerald-600">₹ {loan.pendingInterest?.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-slate-400">Total: ₹ {loan.interestAmount?.toLocaleString('en-IN')}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="font-bold text-slate-900">₹ {loan.totalDue?.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-slate-400">P + I</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-base font-black text-rose-600">₹ {loan.balanceAmount?.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-slate-400">Principal: ₹ {loan.principalAmount?.toLocaleString('en-IN')}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black tracking-wider ${getStatusStyle(loan.status)}`}>
                      {getStatusLabel(loan.status)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => onViewHistory(loan)}
                      title="View History"
                      className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <Clock className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onReceive(loan)}
                      title="Receive Interest"
                      className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                    >
                      <HandCoins className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onReturnPrincipal(loan)}
                      title="Return Principal"
                      className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <ArrowDownCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(loan)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(loan._id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Grid */}
      <div className="grid gap-4 p-4 md:hidden">
        {loans.map((loan) => (
          <div key={loan._id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900">{loan.borrowerName}</h3>
                <p className="text-xs text-slate-500">{loan.contactDetails}</p>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black tracking-wider ${getStatusStyle(loan.status)}`}>
                {getStatusLabel(loan.status)}
              </span>
            </div>
            
            <div className="mb-4 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-3 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Principal</p>
                <p className="font-bold text-slate-700">₹ {loan.principalAmount?.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Interest (Pending)</p>
                <p className="font-bold text-emerald-600">₹ {loan.pendingInterest?.toLocaleString('en-IN')}</p>
              </div>
              <div className="col-span-2 border-t border-slate-200 pt-2">
                <div className="flex justify-between font-black text-rose-600">
                  <span>BALANCE DUE</span>
                  <span>₹ {loan.balanceAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => onViewHistory(loan)}
                className="flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600"
              >
                <Clock className="h-3 w-3" /> History
              </button>
              <button
                onClick={() => onReceive(loan)}
                className="flex items-center gap-1 rounded-lg border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600"
              >
                <HandCoins className="h-3 w-3" /> Interest
              </button>
              <button
                onClick={() => onReturnPrincipal(loan)}
                className="flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600"
              >
                <ArrowDownCircle className="h-3 w-3" /> Principal
              </button>
              <button
                onClick={() => onEdit(loan)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
              <button
                onClick={() => onDelete(loan._id)}
                className="flex items-center gap-1 rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
