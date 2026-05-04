import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Search, Filter, RefreshCw, 
  FileDown, FileSpreadsheet, NotebookText, LayoutDashboard, List, Users
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import * as interestLoanService from '../services/interestLoanService';

import InterestSummaryCards from '../components/interest/InterestSummaryCards';
import InterestLoanTable from '../components/interest/InterestLoanTable';
import InterestLoanForm from '../components/interest/InterestLoanForm';
import BorrowerSummary from '../components/interest/BorrowerSummary';
import ReceiveInterestModal from '../components/interest/ReceiveInterestModal';
import LoanHistoryModal from '../components/interest/LoanHistoryModal';
import EditPaymentModal from '../components/interest/EditPaymentModal';
import ReturnPrincipalModal from '../components/interest/ReturnPrincipalModal';
import EmptyState from '../components/ui/EmptyState';

export default function InterestBook() {
  const { t } = useLanguage();
  const [loans, setLoans] = useState([]);
  const [summary, setSummary] = useState(null);
  const [borrowerSummary, setBorrowerSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'borrowers'
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);
  const [isReturnPrincipalOpen, setIsReturnPrincipalOpen] = useState(false);
  
  const [editingLoan, setEditingLoan] = useState(null);
  const [receivingLoan, setReceivingLoan] = useState(null);
  const [historyLoan, setHistoryLoan] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [returningLoan, setReturningLoan] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [loansData, summaryData, borrowerData] = await Promise.all([
        interestLoanService.getInterestLoans({ search: searchTerm, status: statusFilter }),
        interestLoanService.getInterestLoanDashboard(),
        interestLoanService.getBorrowerSummary()
      ]);
      setLoans(loansData);
      setSummary(summaryData);
      setBorrowerSummary(borrowerData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await interestLoanService.createInterestLoan(data);
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    setSubmitting(true);
    try {
      await interestLoanService.updateInterestLoan(editingLoan._id, data);
      setEditingLoan(null);
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan record?')) return;
    try {
      await interestLoanService.deleteInterestLoan(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleConfirmReceive = async (data) => {
    setSubmitting(true);
    try {
      await interestLoanService.collectInterest(receivingLoan._id, data);
      setIsReceiveOpen(false);
      setReceivingLoan(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to record receipt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnPrincipal = async (data) => {
    setSubmitting(true);
    try {
      await interestLoanService.collectPrincipal(returningLoan._id, data);
      setIsReturnPrincipalOpen(false);
      setReturningLoan(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to record return');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePayment = async (data) => {
    setSubmitting(true);
    try {
      await interestLoanService.updateInterestPayment(historyLoan._id, editingPayment._id, data);
      setIsEditPaymentOpen(false);
      setEditingPayment(null);
      // Refresh history loan data to show updated list in modal
      const updatedLoan = await interestLoanService.getInterestLoan(historyLoan._id);
      setHistoryLoan(updatedLoan);
      fetchData(); // Refresh summary cards and table
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Delete this payment from history?')) return;
    try {
      await interestLoanService.deleteInterestPayment(historyLoan._id, paymentId);
      const updatedLoan = await interestLoanService.getInterestLoan(historyLoan._id);
      setHistoryLoan(updatedLoan);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete payment');
    }
  };

  const handleExportExcel = async () => {
    try {
      const data = await interestLoanService.exportInterestLoansExcel();
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `InterestBook_${new Date().toISOString().slice(0,10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Export failed');
    }
  };

  const handleExportPdf = async () => {
    try {
      const data = await interestLoanService.exportInterestLoansPdf();
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `InterestBook_${new Date().toISOString().slice(0,10)}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('PDF Export failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="rounded-xl border border-slate-100 bg-white p-2 text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">Interest Book</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Loan Interest Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-rose-600 transition-all hover:bg-rose-50 md:flex"
            >
              <FileDown className="h-4 w-4" /> PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 md:flex"
            >
              <FileSpreadsheet className="h-4 w-4" /> Export
            </button>
            <button
              onClick={() => {
                setEditingLoan(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/40"
            >
              <Plus className="h-5 w-5" /> <span className="hidden sm:inline">Add Loan</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6">
        {/* Dashboard Summary */}
        <InterestSummaryCards summary={summary} />

        {/* View Switcher & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-2 shadow-sm">
          <div className="flex rounded-2xl bg-slate-100 p-1">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                view === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="h-4 w-4" /> Loan Records
            </button>
            <button
              onClick={() => setView('borrowers')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                view === 'borrowers' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="h-4 w-4" /> Borrower Wise
            </button>
          </div>

          <div className="flex flex-1 items-center gap-2 min-w-[300px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search borrower name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-200 focus:bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-200 focus:bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="partial_paid">Partial Paid</option>
              <option value="overdue">Overdue</option>
              <option value="closed">Closed</option>
            </select>
            <button 
              onClick={fetchData}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5 text-slate-500 hover:bg-white hover:text-emerald-600"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-6 py-4 text-sm font-medium text-rose-600">
            <RefreshCw className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
            <p className="text-sm font-medium text-slate-500 animate-pulse">Calculating financials...</p>
          </div>
        ) : (
          <>
            {view === 'list' ? (
              loans?.length > 0 ? (
                <InterestLoanTable 
                  loans={loans} 
                  onEdit={(l) => { setEditingLoan(l); setIsFormOpen(true); }}
                  onDelete={handleDelete}
                  onReceive={(l) => { setReceivingLoan(l); setIsReceiveOpen(true); }}
                  onViewHistory={(l) => { setHistoryLoan(l); setIsHistoryOpen(true); }}
                  onReturnPrincipal={(l) => { setReturningLoan(l); setIsReturnPrincipalOpen(true); }}
                />
              ) : (
                <EmptyState 
                  title="No loan records found" 
                  detail="Start by adding your first interest-based loan entry."
                />
              )
            ) : (
              <BorrowerSummary summaries={borrowerSummary} />
            )}
          </>
        )}
      </main>

      {isFormOpen && (
        <InterestLoanForm
          loan={editingLoan}
          submitting={submitting}
          onSubmit={editingLoan ? handleUpdate : handleCreate}
          onCancel={() => { setIsFormOpen(false); setEditingLoan(null); }}
        />
      )}

      {isReceiveOpen && (
        <ReceiveInterestModal
          loan={receivingLoan}
          submitting={submitting}
          onConfirm={handleConfirmReceive}
          onCancel={() => { setIsReceiveOpen(false); setReceivingLoan(null); }}
        />
      )}

      {isHistoryOpen && (
        <LoanHistoryModal
          loan={historyLoan}
          onCancel={() => { setIsHistoryOpen(false); setHistoryLoan(null); }}
          onEditPayment={(p) => { setEditingPayment(p); setIsEditPaymentOpen(true); }}
          onDeletePayment={handleDeletePayment}
        />
      )}

      {isEditPaymentOpen && (
        <EditPaymentModal
          payment={editingPayment}
          submitting={submitting}
          onConfirm={handleUpdatePayment}
          onCancel={() => { setIsEditPaymentOpen(false); setEditingPayment(null); }}
        />
      )}
      {isReturnPrincipalOpen && (
        <ReturnPrincipalModal
          loan={returningLoan}
          submitting={submitting}
          onConfirm={handleReturnPrincipal}
          onCancel={() => { setIsReturnPrincipalOpen(false); setReturningLoan(null); }}
        />
      )}
    </div>
  );
}
