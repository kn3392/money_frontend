import React, { useState, useEffect } from 'react';
import { X, Calculator, IndianRupee, Calendar, User, Phone, FileText } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { useLanguage } from '../../context/LanguageContext';

export default function InterestLoanForm({ loan, onSubmit, onCancel, submitting }) {
  const { t } = useLanguage();
  const toLocalISOString = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    borrowerName: '',
    contactDetails: '',
    principalAmount: '',
    monthlyInterestRate: '',
    startDate: toLocalISOString(new Date()),
    manualMonths: '',
    receivedAmount: '',
    remarks: '',
  });

  const [preview, setPreview] = useState({
    endDate: null,
    monthsUsed: 0,
    interest: 0,
    totalDue: 0,
    balance: 0,
    status: 'active',
  });

  useEffect(() => {
    if (loan) {
      setFormData({
        borrowerName: loan.borrowerName || '',
        contactDetails: loan.contactDetails || '',
        principalAmount: loan.principalAmount?.toString() || '',
        monthlyInterestRate: loan.monthlyInterestRate?.toString() || '',
        startDate: toLocalISOString(loan.startDate),
        manualMonths: loan.manualMonths?.toString() || '',
        receivedAmount: loan.receivedAmount?.toString() || '',
        remarks: loan.remarks || '',
      });
    }
  }, [loan]);

  // Real-time calculation logic
  useEffect(() => {
    const principal = Number(formData.principalAmount) || 0;
    const rate = Number(formData.monthlyInterestRate) || 0;
    const start = new Date(formData.startDate);
    const manualMonths = formData.manualMonths ? Number(formData.manualMonths) : null;
    const received = Number(formData.receivedAmount) || 0;
    const today = new Date();

    // 1. End Date
    let endDate = null;
    if (manualMonths && manualMonths > 0) {
      endDate = new Date(start);
      endDate.setMonth(endDate.getMonth() + manualMonths);
    }

    // 2. Months Used
    let monthsUsed = 0;
    if (manualMonths != null) {
      monthsUsed = manualMonths;
    } else {
      const comparisonDate = today;
      monthsUsed = (comparisonDate.getFullYear() - start.getFullYear()) * 12 + (comparisonDate.getMonth() - start.getMonth());
      if (monthsUsed < 0) monthsUsed = 0;
    }

    // 3. Interest
    const interest = principal * (rate / 100) * monthsUsed;

    // 4. Total Due
    const totalDue = principal + interest;

    // 5. Balance
    const balance = totalDue - received;

    // 6. Status
    let status = 'active';
    const todayNow = new Date();
    todayNow.setHours(0, 0, 0, 0);
    
    const twentyDays = new Date(todayNow);
    twentyDays.setDate(twentyDays.getDate() + 20);

    if (balance <= 0) {
      status = 'done';
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      
      if (todayNow >= end || twentyDays >= end) {
        status = 'due';
      } else if (received > 0) {
        status = 'partial_paid';
      }
    } else if (received > 0) {
      status = 'partial_paid';
    }

    setPreview({
      endDate: endDate ? formatDate(endDate) : 'N/A (Dynamic)',
      monthsUsed,
      interest,
      totalDue,
      balance,
      status
    });
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10";
  const labelClass = "mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
              <Calculator className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {loan ? 'Edit Interest Loan' : 'Add New Interest Loan'}
            </h2>
          </div>
          <button onClick={onCancel} className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="max-h-[80vh] overflow-y-auto p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column: Basic Info */}
            <div className="space-y-4">
              <div>
                <label className={labelClass}><User className="inline h-3 w-3 mr-1" /> Borrower Name</label>
                <input
                  type="text"
                  name="borrowerName"
                  required
                  value={formData.borrowerName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className={labelClass}><Phone className="inline h-3 w-3 mr-1" /> Contact Details</label>
                <input
                  type="text"
                  name="contactDetails"
                  value={formData.contactDetails}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Phone or Address"
                />
              </div>
              <div>
                <label className={labelClass}><IndianRupee className="inline h-3 w-3 mr-1" /> Principal Amount</label>
                <input
                  type="number"
                  name="principalAmount"
                  required
                  min="1"
                  value={formData.principalAmount}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className={labelClass}><Calculator className="inline h-3 w-3 mr-1" /> Monthly Interest Rate %</label>
                <input
                  type="number"
                  name="monthlyInterestRate"
                  required
                  step="0.01"
                  value={formData.monthlyInterestRate}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. 2.0"
                />
              </div>
              <div>
                <label className={labelClass}><Calendar className="inline h-3 w-3 mr-1" /> Start Date</label>
                <div className="relative">
                  <input
                    type="text"
                    name="startDate"
                    required
                    placeholder="DD-MM-YYYY"
                    value={formData.startDate.split('-').reverse().join('-')}
                    onChange={(e) => {
                      const v = e.target.value;
                      // Simple regex to allow typing but eventually we want YYYY-MM-DD for state
                      const parts = v.split('-');
                      if (parts.length === 3 && parts[2].length === 4) {
                        setFormData(prev => ({ ...prev, startDate: `${parts[2]}-${parts[1]}-${parts[0]}` }));
                      }
                    }}
                    className={inputClass}
                  />
                  <input
                    type="date"
                    name="startDateActual"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 opacity-0 cursor-pointer"
                  />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClass}><Calendar className="inline h-3 w-3 mr-1" /> Manual Months (Optional)</label>
                <input
                  type="number"
                  name="manualMonths"
                  value={formData.manualMonths}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Blank for Dynamic"
                />
              </div>
            </div>

            {/* Right Column: Calculations & Preview */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-inner">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-700 underline decoration-emerald-200 underline-offset-4">
                  Calculation Preview
                </h3>
                <div className="rounded-2xl bg-slate-50 p-4 text-[10px] text-slate-500 space-y-1">
                  <p className="font-bold text-slate-700 uppercase tracking-widest text-[9px] mb-2">Auto-Processing:</p>
                  {Number(formData.receivedAmount) >= (preview.interest || 0) && (preview.interest || 0) > 0 ? (
                    <>
                      <p className="text-amber-700 font-bold">• Full interest satisfied. Period will roll over.</p>
                      {Number(formData.receivedAmount) > (preview.interest || 0) && (
                        <p className="text-emerald-700 font-bold">
                          • ₹{(Number(formData.receivedAmount) - (preview.interest || 0)).toLocaleString('en-IN')} will be deducted from Principal Amount.
                        </p>
                      )}
                      <p>• Start Date will move from <span className="font-bold text-slate-700">{formatDate(formData.startDate)}</span> to <span className="font-bold text-amber-600">{preview.endDate}</span></p>
                    </>
                  ) : (
                    <p className="text-blue-700 font-bold">• Partial payment. Interest balance will be updated.</p>
                  )}
                </div>
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between border-b border-emerald-100 pb-2">
                    <span className="text-xs text-slate-500">End Date</span>
                    <span className="text-xs font-bold text-slate-900">{preview.endDate}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-100 pb-2">
                    <span className="text-xs text-slate-500">Months Used</span>
                    <span className="text-xs font-bold text-slate-900">{preview.monthsUsed}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-100 pb-2">
                    <span className="text-xs text-slate-500">Interest Amount</span>
                    <span className="text-xs font-bold text-emerald-600">₹ {preview.interest.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-100 pb-2">
                    <span className="text-xs text-slate-500">Total Due</span>
                    <span className="text-xs font-bold text-blue-700">₹ {preview.totalDue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-sm font-bold text-slate-700">Final Balance</span>
                    <span className="text-sm font-black text-rose-600">₹ {preview.balance.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}><CheckCircle2 className="inline h-3 w-3 mr-1" /> Interest Paid (Current Period)</label>
                <input
                  type="number"
                  name="receivedAmount"
                  min="0"
                  value={formData.receivedAmount}
                  onChange={handleChange}
                  className={`${inputClass} border-emerald-200 bg-emerald-50/20`}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className={labelClass}><FileText className="inline h-3 w-3 mr-1" /> Remarks</label>
                <textarea
                  name="remarks"
                  rows={3}
                  value={formData.remarks}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Any notes..."
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/40 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : loan ? 'Update Loan' : 'Create Loan'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CheckCircle2(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
