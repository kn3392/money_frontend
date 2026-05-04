import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Tag,
  User,
  NotebookText,
  Users,
  Search,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext.jsx';
import { istTodayDateKey } from '../utils/istDate.js';

export default function Home() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/api/health')
      .then((res) => {
        if (!cancelled) setHealth(res.data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.response?.data?.message || err.message || 'Request failed');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        SmartKhata
      </h1>
      <p className="mt-2 text-slate-600">Financial Year Ledger System</p>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          API status
        </h2>
        {health && (
          <p className="mt-2 text-emerald-700">
            {health.message}{' '}
            <span className="text-xs text-slate-500">({health.timestamp})</span>
          </p>
        )}
        {error && <p className="mt-2 text-red-600">{error}</p>}
        {!health && !error && <p className="mt-2 text-slate-500">Checking backend…</p>}
      </section>

      <nav className="mt-8 flex flex-wrap gap-2">
        {token ? (
          <>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/accounts"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <Wallet className="h-4 w-4" />
              Accounts
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <Tag className="h-4 w-4" />
              Categories
            </Link>
            <Link
              to={`/ledger/${istTodayDateKey()}`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <NotebookText className="h-4 w-4" />
              Daily ledger
            </Link>
            <Link
              to="/persons"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <Users className="h-4 w-4" />
              Persons
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <Search className="h-4 w-4" />
              {t('search')}
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Register
            </Link>
          </>
        )}
        <Link
          to="/about"
          className="rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900"
        >
          About
        </Link>
      </nav>

      {user && (
        <p className="mt-6 text-sm text-slate-600">
          Signed in as <span className="font-medium">{user.email}</span>
        </p>
      )}
    </div>
  );
}
