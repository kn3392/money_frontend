import React, { useState } from 'react';
import { X, History, IndianRupee, Calendar, FileText, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

export default function LoanHistoryModal({ loan, onCancel, onEditPayment, onDeletePayment }) {
  const payments = loan?.payments || [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Payment History</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">{loan?.borrowerName}</p>
            </div>
          </div>
          <button onClick={onCancel} className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-slate-50 p-4 text-slate-300">
                <History className="h-12 w-12" />
              </div>
              <p className="text-sm font-medium text-slate-500">No payment history found for this loan.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...payments].reverse().map((payment, i) => (
                <div key={payment._id || i} className="group relative rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-indigo-100 hover:shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-emerald-600">₹ {payment.amount?.toLocaleString('en-IN')}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-bold uppercase text-slate-500">{payment.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(payment.date)}
                        {payment.periodStart && (
                          <>
                            <span className="mx-1">•</span>
                            <span>Period: {formatDate(payment.periodStart)}</span>
                            <ArrowRight className="h-2 w-2" />
                            <span>{formatDate(payment.periodEnd)}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 italic">
                        <FileText className="h-3 w-3" /> {payment.remarks || 'No remarks'}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button 
                        onClick={() => onEditPayment(payment)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                        title="Edit Payment"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => onDeletePayment(payment._id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete Payment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 p-4">
          <button
            onClick={onCancel}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
