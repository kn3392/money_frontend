import React, { useState } from 'react';
import { X, ArrowDownCircle, IndianRupee, Calendar, FileText, Check } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

export default function ReturnPrincipalModal({ loan, onConfirm, onCancel, submitting }) {
  const toLocalISOString = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toLocalISOString(new Date()));
  const [remarks, setRemarks] = useState(`Principal returned by ${loan?.borrowerName}`);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ amount: Number(amount) || 0, date, remarks });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
              <ArrowDownCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Return Principal</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">{loan?.borrowerName}</p>
            </div>
          </div>
          <button onClick={onCancel} className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Principal</p>
              <p className="text-2xl font-black text-slate-900">₹ {loan?.principalAmount?.toLocaleString('en-IN')}</p>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                <IndianRupee className="inline h-3 w-3 mr-1" /> Amount to Return
              </label>
              <input
                type="number"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-2xl font-black text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                placeholder="0.00"
                max={loan?.principalAmount}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                <Calendar className="inline h-3 w-3 mr-1" /> Return Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="DD-MM-YYYY"
                  value={date.split('-').reverse().join('-')}
                  onChange={(e) => {
                    const v = e.target.value;
                    const parts = v.split('-');
                    if (parts.length === 3 && parts[2].length === 4) {
                      setDate(`${parts[2]}-${parts[1]}-${parts[0]}`);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white"
                />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                <FileText className="inline h-3 w-3 mr-1" /> Remarks
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white"
                placeholder="Notes about this return..."
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/40 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Confirm Return'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
