import React, { useState } from 'react';
import { X, HandCoins, IndianRupee, Calendar, FileText, Check } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

export default function ReceiveInterestModal({ loan, onConfirm, onCancel, submitting }) {
  const toLocalISOString = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const [amount, setAmount] = useState(loan?.pendingInterest?.toString() || '');
  const [date, setDate] = useState(toLocalISOString(new Date()));
  const [remarks, setRemarks] = useState(`Interest received for ${loan?.borrowerName}`);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ amount: Number(amount) || 0, date, remarks });
  };

  const quickAmounts = [
    { label: 'Full Interest', value: loan?.pendingInterest || 0 },
    { label: 'Round Off', value: Math.round((loan?.pendingInterest || 0) / 100) * 100 },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-amber-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-600">
              <HandCoins className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Receive Interest</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">{loan?.borrowerName}</p>
            </div>
          </div>
          <button onClick={onCancel} className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Amount Field with Quick Actions */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                <IndianRupee className="inline h-3 w-3 mr-1" /> Amount Received
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-2xl font-black text-slate-900 outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  placeholder="0.00"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Check className="h-6 w-6" />
                </div>
              </div>
              
              <div className="mt-3 flex gap-2">
                {quickAmounts.map((qa, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAmount(qa.value)}
                    className="rounded-lg bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-600 hover:bg-amber-100 transition-colors"
                  >
                    {qa.label}: ₹{qa.value.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                <Calendar className="inline h-3 w-3 mr-1" /> Collection Date
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-amber-500 focus:bg-white"
                />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 opacity-0 cursor-pointer"
                />
                <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-amber-500 focus:bg-white"
                placeholder="Notes about this collection..."
              />
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-[10px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700 uppercase tracking-widest text-[9px] mb-2">Auto-Processing:</p>
              {Number(amount) >= (loan?.pendingInterest || 0) && (loan?.pendingInterest || 0) > 0 ? (
                <>
                  <p className="text-amber-700 font-bold">• Full interest satisfied. Period will roll over.</p>
                  {Number(amount) > (loan?.pendingInterest || 0) && (
                    <p className="text-emerald-700 font-bold">
                      • ₹{(Number(amount) - (loan?.pendingInterest || 0)).toLocaleString('en-IN')} will be deducted from Principal Amount.
                    </p>
                  )}
                  <p>• Start Date will move from <span className="font-bold text-slate-700">{formatDate(loan?.startDate)}</span> to <span className="font-bold text-amber-600">{formatDate(loan?.endDate || Date.now())}</span></p>
                </>
              ) : (
                <p className="text-blue-700 font-bold">• Partial payment. Interest balance will be updated.</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-2xl bg-amber-600 py-4 text-sm font-bold text-white shadow-lg shadow-amber-600/20 transition-all hover:bg-amber-700 hover:shadow-amber-600/40 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Confirm Receipt'}
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
