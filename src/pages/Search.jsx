import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext.jsx';
import * as accountService from '../services/accountService.js';
import * as categoryService from '../services/categoryService.js';
import * as personService from '../services/personService.js';
import * as tagService from '../services/tagService.js';
import { searchTransactions } from '../services/searchApi.js';
import { formatDateKey } from '../utils/dateFormatter.js';

const PAGE_SIZE = 20;

function formatMoney(n) {
  return Number(n ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function rowSubtitle(tx) {
  if (tx.type === 'transfer') {
    const from = tx.fromAccountId?.name ?? '—';
    const to = tx.toAccountId?.name ?? '—';
    return `${from} → ${to}`;
  }
  const parts = [tx.categoryId?.name, tx.accountId?.name].filter(Boolean);
  if (tx.personId?.name) parts.push(tx.personId.name);
  return parts.join(' · ') || '—';
}

const URL_KEYS = [
  'q',
  'amount',
  'dateFrom',
  'dateTo',
  'type',
  'accountId',
  'categoryId',
  'personId',
  'financialYear',
  'tagId',
  'sort',
  'page',
  'run',
];

function typeFromUrl(sp) {
  const v = sp.get('type') ?? '';
  return ['income', 'expense', 'transfer'].includes(v) ? v : '';
}

export default function Search() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlAutoRanRef = useRef(false);

  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [persons, setPersons] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [results, setResults] = useState(null);

  const [q, setQ] = useState(() => searchParams.get('q') ?? '');
  const [amount, setAmount] = useState(() => searchParams.get('amount') ?? '');
  const [dateFrom, setDateFrom] = useState(() => searchParams.get('dateFrom') ?? '');
  const [dateTo, setDateTo] = useState(() => searchParams.get('dateTo') ?? '');
  const [type, setType] = useState(() => typeFromUrl(searchParams));
  const [accountId, setAccountId] = useState(() => searchParams.get('accountId') ?? '');
  const [categoryId, setCategoryId] = useState(() => searchParams.get('categoryId') ?? '');
  const [personId, setPersonId] = useState(() => searchParams.get('personId') ?? '');
  const [financialYear, setFinancialYear] = useState(
    () => searchParams.get('financialYear') ?? ''
  );
  const [tagId, setTagId] = useState(() => searchParams.get('tagId') ?? '');
  const [sort, setSort] = useState(() =>
    searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest'
  );
  const [page, setPage] = useState(() => {
    const p = Number(searchParams.get('page'));
    return Number.isFinite(p) && p >= 1 ? Math.floor(p) : 1;
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ac, cats, pdata, tagRows] = await Promise.all([
          accountService.getAccounts(),
          categoryService.getCategories(),
          personService.getPersons(),
          tagService.listTags().catch(() => []),
        ]);
        if (cancelled) return;
        setAccounts(Array.isArray(ac) ? ac : []);
        setCategories(Array.isArray(cats) ? cats : []);
        setTags(Array.isArray(tagRows) ? tagRows : []);
        const plist = pdata?.persons ?? [];
        setPersons(plist.filter((p) => p.isActive !== false));
      } catch (e) {
        if (!cancelled)
          setErr(e.response?.data?.message || e.message || 'Failed to load filters');
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const buildParams = useCallback(
    (nextPage) => {
      /** @type {Record<string, string | number>} */
      const params = {
        page: nextPage,
        limit: PAGE_SIZE,
        sort,
      };
      const qt = q.trim();
      if (qt) params.q = qt;
      if (amount.trim()) {
        const n = Number(amount);
        if (Number.isFinite(n) && n > 0) params.amount = n;
      }
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (type) params.type = type;
      if (accountId) params.accountId = accountId;
      if (categoryId) params.categoryId = categoryId;
      if (personId) params.personId = personId;
      if (financialYear.trim()) params.financialYear = financialYear.trim();
      if (tagId.trim()) params.tagId = tagId.trim();
      return params;
    },
    [
      q,
      amount,
      dateFrom,
      dateTo,
      type,
      accountId,
      categoryId,
      personId,
      financialYear,
      tagId,
      sort,
    ]
  );

  const pushUrlParams = useCallback(
    (nextPage) => {
      const next = new URLSearchParams();
      const qt = q.trim();
      if (qt) next.set('q', qt);
      if (amount.trim()) next.set('amount', amount.trim());
      if (dateFrom) next.set('dateFrom', dateFrom);
      if (dateTo) next.set('dateTo', dateTo);
      if (type) next.set('type', type);
      if (accountId) next.set('accountId', accountId);
      if (categoryId) next.set('categoryId', categoryId);
      if (personId) next.set('personId', personId);
      if (financialYear.trim()) next.set('financialYear', financialYear.trim());
      if (tagId.trim()) next.set('tagId', tagId.trim());
      if (sort && sort !== 'newest') next.set('sort', sort);
      next.set('page', String(nextPage));
      next.set('run', '1');
      setSearchParams(next, { replace: true });
    },
    [
      q,
      amount,
      dateFrom,
      dateTo,
      type,
      accountId,
      categoryId,
      personId,
      financialYear,
      tagId,
      sort,
      setSearchParams,
    ]
  );

  const runSearch = useCallback(
    async (nextPage = 1, options = {}) => {
      const { syncUrl = true } = options;
      setLoading(true);
      setErr('');
      try {
        const data = await searchTransactions(buildParams(nextPage));
        setResults(data);
        setPage(nextPage);
        if (syncUrl) pushUrlParams(nextPage);
      } catch (e) {
        setResults(null);
        setErr(e.response?.data?.message || e.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    },
    [buildParams, pushUrlParams]
  );

  useEffect(() => {
    if (loadingMeta || urlAutoRanRef.current) return;
    const hasIntent = URL_KEYS.some((k) => {
      const v = searchParams.get(k);
      return v !== null && String(v).trim() !== '';
    });
    if (!hasIntent) return;
    urlAutoRanRef.current = true;
    void runSearch(page, { syncUrl: false });
  }, [loadingMeta, page, runSearch, searchParams]);

  const totalPages = results?.totalPages ?? 0;
  const txs = results?.transactions ?? [];
  const filteredCats = type
    ? categories.filter((c) => c.type === type)
    : categories;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="border-b bg-white px-4 py-4">
        <div className="mx-auto flex max-w-4xl flex-col gap-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-3 w-3" /> {t('dashboard')}
          </Link>
          <div className="flex items-center gap-2">
            <SearchIcon className="h-6 w-6 text-emerald-600" />
            <h1 className="text-xl font-semibold text-slate-900">{t('search')}</h1>
          </div>
          <p className="text-xs text-slate-600">{t('searchHint')}</p>
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-4xl space-y-6 px-4">
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          {loadingMeta ? (
            <div className="flex justify-center py-8 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void runSearch(1, { syncUrl: true });
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-sm">
                  <span className="text-slate-600">{t('noteContains')}</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                  />
                </label>
                <label className="text-sm">
                  <span className="text-slate-600">{t('amount')}</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000"
                  />
                </label>
                <label className="text-sm">
                  <span className="text-slate-600">{t('financialYear')}</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={financialYear}
                    onChange={(e) => setFinancialYear(e.target.value)}
                    placeholder="2026-27"
                  />
                </label>
                <label className="text-sm">
                  <span className="text-slate-600">{t('dateFrom')}</span>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </label>
                <label className="text-sm">
                  <span className="text-slate-600">{t('dateTo')}</span>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </label>
                <label className="text-sm">
                  <span className="text-slate-600">{t('type')}</span>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      setCategoryId('');
                    }}
                  >
                    <option value="">{t('allTypes')}</option>
                    <option value="income">{t('income')}</option>
                    <option value="expense">{t('expense')}</option>
                    <option value="transfer">{t('transfer')}</option>
                  </select>
                </label>
                <label className="text-sm">
                  <span className="text-slate-600">{t('account')}</span>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                  >
                    <option value="">{t('any')}</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  <span className="text-slate-600">{t('category')}</span>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">{t('any')}</option>
                    {filteredCats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  <span className="text-slate-600">{t('person')}</span>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={personId}
                    onChange={(e) => setPersonId(e.target.value)}
                  >
                    <option value="">{t('any')}</option>
                    {persons.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  <span className="text-slate-600">{t('tags')}</span>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={tagId}
                    onChange={(e) => setTagId(e.target.value)}
                  >
                    <option value="">{t('any')}</option>
                    {tags.map((tg) => (
                      <option key={tg._id} value={tg._id}>
                        {tg.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  <span className="text-slate-600">{t('sortOrder')}</span>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="newest">{t('sortNewest')}</option>
                    <option value="oldest">{t('sortOldest')}</option>
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SearchIcon className="h-4 w-4" />
                  )}
                  {t('search')}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setQ('');
                    setAmount('');
                    setDateFrom('');
                    setDateTo('');
                    setType('');
                    setAccountId('');
                    setCategoryId('');
                    setPersonId('');
                    setFinancialYear('');
                    setTagId('');
                    setSort('newest');
                    setPage(1);
                    setResults(null);
                    setErr('');
                    setSearchParams({}, { replace: true });
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {t('clearFilters')}
                </button>
              </div>
            </form>
          )}
        </motion.section>

        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {err}
          </div>
        )}

        {results && (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">
                {t('results')} ({results.total ?? 0})
              </h2>
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => void runSearch(page - 1)}
                    className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="tabular-nums text-slate-600">
                    {page} / {totalPages || 1}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages || loading}
                    onClick={() => void runSearch(page + 1)}
                    className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {txs.length === 0 ? (
              <p className="px-4 py-12 text-center text-sm text-slate-500">
                {t('noSearchResults')}
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {txs.map((tx) => (
                  <li
                    key={tx._id}
                    className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase text-slate-700">
                          {tx.type}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          {formatDateKey(tx.dateKey)}
                        </span>
                        <span className="font-semibold tabular-nums text-slate-900">
                          ₹ {formatMoney(tx.amount)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{rowSubtitle(tx)}</p>
                      {tx.note ? (
                        <p className="mt-0.5 text-slate-800">{tx.note}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/ledger/${tx.dateKey}`)}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {t('openLedger')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
