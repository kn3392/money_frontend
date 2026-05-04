import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Loader2,
  UserPlus,
  Users,
  Pencil,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import * as personService from '../services/personService.js';
import { formatDateKey } from '../utils/dateFormatter.js';

function Money({ n }) {
  return (
    <span className="tabular-nums font-medium">
      ₹ {Number(n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
    </span>
  );
}

/** balance = taken − given · negative ⇒ you lent more than you got back (pending exposure). */
function BalanceHint({ balance }) {
  const b = Number(balance);
  return (
    <p className="mt-2 text-xs text-slate-600">
      Balance <Money n={balance} /> —{' '}
      {b < 0 ? (
        <span className="text-amber-800">
          Negative: overall you gave more than you received back.
        </span>
      ) : b > 0 ? (
        <span className="text-emerald-800">
          Positive: you received more overall than you gave.
        </span>
      ) : (
        <span>Even totals.</span>
      )}
    </p>
  );
}

function PersonDetail({ personId }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState('');
  const [editingHeader, setEditingHeader] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [headerSaving, setHeaderSaving] = useState(false);

  async function refreshDataQuiet() {
    try {
      const d = await personService.getPersonDetail(personId);
      setData(d);
    } catch (e) {
      setErr(e.response?.data?.message || e.message);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr('');
    personService
      .getPersonDetail(personId)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setErr(e.response?.data?.message || e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [personId]);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
      </div>
    );

  if (err || !data)
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-red-600">
        {err || 'Not found'}{' '}
        <Link className="ml-4 text-emerald-700" to="/persons">
          Back to list
        </Link>
      </div>
    );

  const p = data.person;
  const tx = data.transactions ?? [];

  async function saveHeaderName(e) {
    e?.preventDefault();
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    setHeaderSaving(true);
    setBanner('');
    try {
      await personService.updatePerson(personId, { name: trimmed });
      await refreshDataQuiet();
      setEditingHeader(false);
      setBanner('Name saved.');
    } catch (e) {
      setErr(e.response?.data?.message || e.message);
    } finally {
      setHeaderSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/persons"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> All persons
      </Link>
      {banner && (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {banner}
        </p>
      )}
      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {!editingHeader ? (
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{p.name}</h1>
            <button
              type="button"
              aria-label="Edit person name"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              onClick={() => {
                setNameDraft(p.name);
                setEditingHeader(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <form className="flex flex-wrap gap-2" onSubmit={(e) => void saveHeaderName(e)}>
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className="flex-1 min-w-[12rem] rounded-lg border border-slate-300 px-3 py-2 text-lg"
              autoFocus
            />
            <button
              type="submit"
              disabled={headerSaving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
              onClick={() => setEditingHeader(false)}
            >
              Cancel
            </button>
          </form>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-slate-500">Total given</p>
            <Money n={p.totalGiven} />
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Total taken</p>
            <Money n={p.totalTaken} />
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Balance</p>
            <Money n={p.balance} />
          </div>
        </div>
        <BalanceHint balance={p.balance} />
        <p className="mt-4 text-[11px] text-slate-500">{data.balanceConventionHelp}</p>
      </header>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Related entries (income & expense)
          </h2>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Permanently deactivate ${p.name}?`)) {
                personService.deletePerson(personId).then(() => {
                  window.location.href = '/persons';
                });
              }
            }}
            className="flex items-center gap-1 text-xs font-medium text-red-600 hover:bg-red-50 px-2 py-1 rounded"
          >
            <Trash2 className="h-3.5 w-3.5" /> Deactivate Person
          </button>
        </div>
        <ul className="space-y-2">
          {tx.length === 0 && (
            <li className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
              No linked transactions yet
            </li>
          )}
          {tx.map((row) => (
            <li
              key={String(row._id)}
              className="rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-medium capitalize">{row.type}</span>
                <span className="text-slate-500">{formatDateKey(row.dateKey)}</span>
              </div>
              <p className="mt-2 text-lg">
                <Money n={row.amount} />
              </p>
              {row.note && <p className="mt-1 text-slate-700">{row.note}</p>}
              <p className="mt-1 text-xs text-slate-500">
                {[row.accountId?.name, row.categoryId?.name].filter(Boolean).join(' · ')}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function PersonLedger() {
  const { id: routeId } = useParams();

  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [notice, setNotice] = useState('');
  const [editId, setEditId] = useState(null);
  const [editNameVal, setEditNameVal] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  async function reload() {
    setLoading(true);
    setError('');
    try {
      const data = await personService.getPersons();
      const list = data.persons ?? [];
      setPeople(list.filter((x) => x.isActive !== false));
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!routeId) void reload();
  }, [routeId]);

  if (routeId) {
    return <PersonDetail personId={routeId} />;
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await personService.createPerson({ name: newName.trim() });
      setNewName('');
      setCreating(false);
      setNotice('Person added.');
      await reload();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  async function deactivate(p) {
    if (!window.confirm(`Deactivate "${p.name}"?`)) return;
    try {
      await personService.deletePerson(p.id);
      setNotice(`Deactivated "${p.name}".`);
      setEditId(null);
      await reload();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  async function saveListEdit(person) {
    const trimmed = editNameVal.trim();
    if (!trimmed) return;
    setEditSaving(true);
    setError('');
    try {
      await personService.updatePerson(person.id, { name: trimmed });
      setEditId(null);
      setNotice(`Updated "${person.name}" → "${trimmed}".`);
      await reload();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-8 w-8 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-semibold">Person ledger</h1>
            <p className="text-sm text-slate-600">
              Track K/V/N-style informal lending flows with income & expense postings.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreating(!creating);
            if (!creating) window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <UserPlus className="h-4 w-4" />
          Add person
        </button>
      </div>

      <p className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700">
        On the daily ledger choose <strong>Income</strong> when they return money (
        optional person link ). Choose <strong>Expense</strong> when you lend / give cash to
        someone (again link the person ). Each movement updates totals here automatically.
      </p>

      {notice && (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {notice}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {creating && (
        <form
          onSubmit={(e) => void handleCreate(e)}
          className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <label className="block text-sm font-medium text-slate-700">
            Name (e.g. K, V, N)
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <div className="mt-3 flex gap-2">
            <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white">
              Save
            </button>
            <button
              type="button"
              className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
              onClick={() => setCreating(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
        </div>
      ) : people.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-6 py-16 text-center text-slate-600">
          No active persons · add names you track against (K, V, N, … )
        </p>
      ) : (
        <ul className="space-y-3">
          {people.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between"
            >
              {editId === p.id ? (
                <form
                  className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void saveListEdit(p);
                  }}
                >
                  <input
                    value={editNameVal}
                    onChange={(e) => setEditNameVal(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 sm:max-w-xs"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={editSaving}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border px-3 py-2 text-xs hover:bg-slate-50"
                      onClick={() => setEditId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <Link to={`/persons/${p.id}`} className="group flex-1">
                  <span className="text-lg font-semibold text-emerald-800 group-hover:underline">
                    {p.name}
                  </span>
                  <BalanceHint balance={p.balance} />
                </Link>
              )}
              {editId !== p.id && (
                <div className="flex gap-1 self-start sm:self-auto">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                    aria-label={`Rename ${p.name}`}
                    onClick={() => {
                      setEditId(p.id);
                      setEditNameVal(p.name);
                    }}
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                    onClick={() => void deactivate(p)}
                    aria-label={`Deactivate ${p.name}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
