import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Wallet,
  ArrowRightLeft,
  Shield,
  KeyRound,
  LogOut,
  Pencil,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import * as profileApi from '../services/profileApi.js';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getUserDisplayName } from '../utils/userDisplayName';

function formatMoney(n) {
  return Number(n ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function avatarLetter(user) {
  const name = getUserDisplayName(user);
  if (name && name !== 'User') return name.charAt(0).toUpperCase();
  const em = user?.email;
  if (typeof em === 'string' && em.length) return em.charAt(0).toUpperCase();
  return '?';
}

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();

  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState('');

  const [pinInput, setPinInput] = useState('');
  const [verifyPin, setVerifyPin] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [nameEdit, setNameEdit] = useState('');
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    setOverviewError('');
    try {
      const data = await profileApi.getProfileOverview();
      setOverview(data);
    } catch (e) {
      setOverviewError(e.response?.data?.message || e.message || t('profileLoadError'));
    } finally {
      setOverviewLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const displayUser = overview?.user ?? user;

  useEffect(() => {
    if (editOpen && displayUser) {
      setNameEdit(typeof displayUser.name === 'string' ? displayUser.name.trim() : '');
    }
  }, [editOpen, displayUser]);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  async function handleSetPin(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    setBusy(true);
    try {
      await api.put('/api/auth/set-pin', { pin: pinInput });
      setPinInput('');
      setMsg(t('saved'));
      await refreshUser();
      await loadOverview();
    } catch (error) {
      setErr(error.response?.data?.message || error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyPin(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    setBusy(true);
    try {
      await api.post('/api/auth/verify-pin', { pin: verifyPin });
      setVerifyPin('');
      setMsg(t('saved'));
    } catch (error) {
      setErr(error.response?.data?.message || error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDisablePin() {
    setErr('');
    setMsg('');
    setBusy(true);
    try {
      await api.put('/api/auth/disable-pin');
      setMsg(t('saved'));
      await refreshUser();
      await loadOverview();
    } catch (error) {
      setErr(error.response?.data?.message || error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    const trimmed = nameEdit.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await profileApi.updateProfileName(trimmed);
      setMsg(t('profileUpdated'));
      setEditOpen(false);
      await refreshUser();
      await loadOverview();
    } catch (error) {
      setErr(error.response?.data?.message || error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (newPw !== confirmPw) {
      setErr(t('passwordMismatch'));
      return;
    }
    setBusy(true);
    try {
      await profileApi.changePassword(currentPw, newPw);
      setMsg(t('passwordUpdated'));
      setPwOpen(false);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (error) {
      setErr(error.response?.data?.message || error.message);
    } finally {
      setBusy(false);
    }
  }

  const memberSince = useMemo(() => {
    const iso = displayUser?.createdAt;
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString(lang === 'gu' ? 'gu-IN' : 'en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  }, [displayUser?.createdAt, lang]);

  const stats = overview?.stats;

  const inputClass =
    'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/30 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2';

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label={t('backToDashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{t('profileTitle')}</h1>
              <p className="text-sm text-slate-500">{t('profileSubtitle')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {(err || overviewError) && (
          <div
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
              <span>{err || overviewError}</span>
              {overviewError && (
                <button
                  type="button"
                  onClick={() => void loadOverview()}
                  className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium hover:bg-red-100"
                >
                  {t('retry')}
                </button>
              )}
            </div>
          </div>
        )}

        {msg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {msg}
          </div>
        )}

        {/* Identity */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-2xl font-semibold text-white shadow-inner"
              aria-hidden
            >
              {displayUser ? avatarLetter(displayUser) : '?'}
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              {!displayUser ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('loadingProfile')}
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xl font-semibold text-slate-900">
                      {getUserDisplayName(displayUser)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {displayUser.email}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {t('memberSince')}: {memberSince}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                    >
                      <Pencil className="h-4 w-4" />
                      {t('editProfile')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPwOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                    >
                      <KeyRound className="h-4 w-4" />
                      {t('changePassword')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <User className="h-4 w-4" />
            {t('profileStatsTitle')}
          </h2>
          {overviewLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              {t('loadingProfile')}
            </div>
          ) : stats ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">{t('totalAccountsStat')}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
                  {stats.totalAccounts}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="flex items-center gap-1 text-xs font-medium uppercase text-slate-500">
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  {t('totalTransactionsStat')}
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
                  {stats.totalTransactions}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 sm:col-span-1">
                <p className="flex items-center gap-1 text-xs font-medium uppercase text-emerald-800">
                  <Wallet className="h-3.5 w-3.5" />
                  {t('totalAvailableStat')}
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-emerald-900">
                  ₹ {formatMoney(stats.totalAvailableBalance)}
                </p>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-500">{t('profileLoadError')}</p>
          )}
          <p className="mt-4 text-xs text-slate-400">{t('comingSoonNote')}</p>
        </section>

        {/* Security */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Shield className="h-4 w-4" />
            {t('securitySection')}
          </h2>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-600">{t('pinLockStatus')}:</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                displayUser?.isPinEnabled
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {displayUser?.isPinEnabled ? t('pinEnabled') : t('pinDisabled')}
            </span>
          </div>

          <h3 className="text-sm font-medium text-slate-800">{t('optionalPinTitle')}</h3>
          <form onSubmit={handleSetPin} className="mt-3 space-y-2">
            <label className="block text-xs font-medium text-slate-600">{t('newPinLabel')}</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <input
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                placeholder="••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className={inputClass}
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {t('savePin')}
              </button>
            </div>
          </form>
          <form onSubmit={handleVerifyPin} className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            <label className="block text-xs font-medium text-slate-600">{t('verifyPinLabel')}</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                placeholder="••••"
                value={verifyPin}
                onChange={(e) => setVerifyPin(e.target.value)}
                className={inputClass}
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
              >
                {t('verifyPinBtn')}
              </button>
            </div>
          </form>
          <button
            type="button"
            onClick={() => void handleDisablePin()}
            disabled={busy}
            className="mt-4 text-sm font-medium text-red-700 hover:underline disabled:opacity-50"
          >
            {t('disablePin')}
          </button>
        </section>

        {/* Language */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">{t('language')}</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input type="radio" name="lng" checked={lang === 'en'} onChange={() => setLang('en')} />
              {t('english')}
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input type="radio" name="lng" checked={lang === 'gu'} onChange={() => setLang('gu')} />
              {t('gujarati')}
            </label>
          </div>
          <p className="mt-3 text-xs text-slate-500">{t('unicodeNotesHint')}</p>
        </section>

        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 sm:w-auto sm:px-8"
        >
          <LogOut className="h-4 w-4" />
          {t('logout')}
        </button>
      </main>

      {/* Edit name modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-slate-900">{t('editProfile')}</h3>
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <label className="block text-sm font-medium text-slate-700">{t('displayNameLabel')}</label>
              <input
                type="text"
                value={nameEdit}
                onChange={(e) => setNameEdit(e.target.value)}
                className={inputClass}
                autoComplete="name"
                dir="auto"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={busy || !nameEdit.trim()}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password modal */}
      {pwOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-slate-900">{t('changePassword')}</h3>
            <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
              <label className="block text-xs font-medium text-slate-600">{t('currentPasswordLabel')}</label>
              <input
                type="password"
                autoComplete="current-password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className={inputClass}
              />
              <label className="block text-xs font-medium text-slate-600">{t('newPasswordLabel')}</label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder={t('passwordPlaceholder')}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className={inputClass}
              />
              <label className="block text-xs font-medium text-slate-600">{t('confirmPasswordLabel')}</label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className={inputClass}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPwOpen(false);
                    setCurrentPw('');
                    setNewPw('');
                    setConfirmPw('');
                  }}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
