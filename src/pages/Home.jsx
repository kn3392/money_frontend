import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  LayoutDashboard,
  NotebookText,
  PiggyBank,
  Landmark,
  BarChart3,
  RefreshCw,
  Shield,
  ArrowRight,
  CheckCircle2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext.jsx';
import { istTodayDateKey } from '../utils/istDate.js';

const FEATURES = [
  { icon: NotebookText, label: 'dailyLedger' },
  { icon: PiggyBank, label: 'savingsGoals' },
  { icon: Landmark, label: 'loans' },
  { icon: BarChart3, label: 'advancedReports' },
  { icon: RefreshCw, label: 'recurring' },
  { icon: Shield, label: 'securitySection' },
];

export default function Home() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/api/health')
      .then((res) => { if (!cancelled) setHealth(res.data); })
      .catch((err) => {
        if (!cancelled)
          setError(err.response?.data?.message || err.message || 'Request failed');
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-900/40">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">SmartKhata</span>
          </div>
          <nav className="flex items-center gap-2">
            {token ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                {t('dashboard')}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10">
        <section className="mx-auto max-w-5xl px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Financial Year Ledger System
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Smart finances,{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                simply tracked
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
              SmartKhata helps you manage daily income, expenses, loans, budgets, and savings goals — all in one place. Available in English and ગુજરાતી.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {token ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 transition-colors"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    {t('dashboard')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/ledger/${istTodayDateKey()}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur hover:bg-white/20 transition-colors"
                  >
                    <NotebookText className="h-5 w-5" />
                    {t('dailyLedger')}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 transition-colors"
                  >
                    Create free account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur hover:bg-white/20 transition-colors"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </section>

        {/* Features grid */}
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-slate-200">{t(label)}</span>
              </div>
            ))}
          </motion.div>
        </section>

        {/* What's included */}
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur"
          >
            <h2 className="text-xl font-bold text-white mb-6">{t('aboutFeatures')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                t('aboutF1'), t('aboutF2'), t('aboutF3'), t('aboutF4'),
                t('aboutF5'), t('aboutF6'), t('aboutF7'), t('aboutF8'),
                t('aboutF9'), t('aboutF10'),
              ].map((f) => (
                <div key={f} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="text-sm text-slate-300">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* API status + user info */}
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur"
          >
            <div className="flex items-center gap-2 text-sm">
              {health ? (
                <>
                  <Wifi className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">{t('apiStatus')}:</span>
                  <span className="text-slate-300">{health.message}</span>
                </>
              ) : error ? (
                <>
                  <WifiOff className="h-4 w-4 text-red-400" />
                  <span className="text-red-400">{error}</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-slate-500 animate-pulse" />
                  <span className="text-slate-500">{t('checkingBackend')}</span>
                </>
              )}
            </div>
            {user && (
              <p className="text-sm text-slate-400">
                {t('signedInAs')}{' '}
                <span className="font-medium text-slate-200">{user.email}</span>
              </p>
            )}
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 text-center">
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} SmartKhata ·{' '}
          <Link to="/about" className="hover:text-slate-400 transition-colors">
            About
          </Link>
        </p>
      </footer>
    </div>
  );
}
