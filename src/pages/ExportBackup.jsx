import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileDown,
  FileJson,
  FileSpreadsheet,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import * as ex from '../services/exportApi.js';
import { istTodayDateKey } from '../utils/istDate.js';
import { useToast } from '../context/ToastContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ExportBackup() {
  const { push } = useToast();
  const { t } = useLanguage();
  const today = istTodayDateKey();
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(Number(today.slice(5, 7)));
  const [year, setYear] = useState(Number(today.slice(0, 4)));
  const [fy, setFy] = useState('2026-27');
  const [busy, setBusy] = useState('');
  const [restoreFile, setRestoreFile] = useState(null);
  const [replace, setReplace] = useState(false);
  const [confirmTxt, setConfirmTxt] = useState('');

  async function wrap(key, fn) {
    setBusy(key);
    try {
      await fn();
      push('Download started');
    } catch (e) {
      push(e.response?.data?.message || e.message, 'error');
    } finally {
      setBusy('');
    }
  }

  async function doRestore() {
    if (!restoreFile) {
      push('Choose a backup JSON file', 'error');
      return;
    }
    if (confirmTxt !== 'RESTORE') {
      push('Type RESTORE to confirm', 'error');
      return;
    }
    setBusy('restore');
    try {
      const res = await ex.restoreBackupJson(restoreFile, {
        replaceExisting: replace,
      });
      push(`Restored (${res.mode})`);
      setConfirmTxt('');
      setRestoreFile(null);
    } catch (e) {
      push(e.response?.data?.message || e.message, 'error');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="border-b bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-start justify-between gap-4">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-3 w-3" /> {t('dashboard')}
            </Link>
            <h1 className="mt-2 text-xl font-semibold">{t('export')}</h1>
            <p className="text-xs text-slate-600">
              PDF / Excel UTF-8 (Gujarati notes preserved) · JSON backup restores only for signed-in account.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-3xl space-y-8 px-4">
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            PDF
          </h2>
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-sm">
                Date
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block rounded-lg border px-2 py-2"
                />
              </label>
              <button
                type="button"
                disabled={busy === 'd'}
                onClick={() =>
                  void wrap('d', () => ex.downloadDailyPdf(date))
                }
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {busy === 'd' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Daily PDF
              </button>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-sm">
                Month
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="mt-1 w-20 rounded-lg border px-2 py-2"
                />
              </label>
              <label className="text-sm">
                Year
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="mt-1 w-28 rounded-lg border px-2 py-2"
                />
              </label>
              <button
                type="button"
                disabled={busy === 'm'}
                onClick={() =>
                  void wrap('m', () => ex.downloadMonthlyPdf(month, year))
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
              >
                {busy === 'm' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Monthly PDF
              </button>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-sm">
                Financial year
                <input
                  value={fy}
                  onChange={(e) => setFy(e.target.value)}
                  placeholder="2026-27"
                  className="mt-1 block w-32 rounded-lg border px-2 py-2"
                />
              </label>
              <button
                type="button"
                disabled={busy === 'fy'}
                onClick={() => void wrap('fy', () => ex.downloadFYPdf(fy))}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
              >
                {busy === 'fy' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                FY PDF
              </button>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Excel & JSON
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy === 'x'}
              onClick={() =>
                void wrap('x', () => ex.downloadTransactionsExcel())
              }
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {busy === 'x' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              Transactions Excel
            </button>
            <button
              type="button"
              disabled={busy === 'j'}
              onClick={() => void wrap('j', () => ex.downloadJsonBackup())}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
            >
              {busy === 'j' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileJson className="h-4 w-4" />
              )}
              JSON backup
            </button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-1 h-5 w-5 text-amber-800" />
            <div className="text-sm">
              <h2 className="font-semibold text-amber-950">Restore backup</h2>
              <p className="mt-1 text-amber-900">
                Types <kbd className="rounded bg-white px-1">RESTORE</kbd> ·
                optionally wipe then replace accounts/categories/transactions for this user only.
              </p>
            </div>
          </div>
          <label className="mt-4 block text-sm font-medium">
            Backup file (.json)
            <input
              type="file"
              accept=".json,application/json"
              onChange={(e) => setRestoreFile(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm"
            />
          </label>
          <label className="mt-3 flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={replace}
              onChange={(e) => setReplace(e.target.checked)}
            />
            Replace existing data before import (destructive)
          </label>
          <label className="mt-3 block text-sm">
            Confirmation
            <input
              placeholder="RESTORE"
              value={confirmTxt}
              onChange={(e) => setConfirmTxt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-amber-300 bg-white px-3 py-2"
            />
          </label>
          <button
            type="button"
            disabled={busy === 'restore'}
            onClick={() => void doRestore()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy === 'restore' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Run restore
          </button>
        </motion.section>
      </main>
    </div>
  );
}
