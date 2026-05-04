import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export function DailyTrendChart({ days }) {
  const data = (days ?? []).map((d) => ({
    date: d.dateKey,
    income: d.income,
    expense: d.expense,
    net: d.netSavings,
  }));
  if (!data.length) return <p className="text-sm text-slate-500">No data in range.</p>;
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#059669" dot={false} />
          <Line type="monotone" dataKey="expense" stroke="#dc2626" dot={false} />
          <Line type="monotone" dataKey="net" stroke="#2563eb" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryComparisonChart({ lines }) {
  const data = (lines ?? []).slice(0, 12).map((l) => ({
    cat: l.categoryId?.slice(-4) ?? l.categoryId,
    current: l.currentMonth,
    previous: l.previousMonth,
  }));
  if (!data.length) return <p className="text-sm text-slate-500">No expense categories.</p>;
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="cat" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="current" fill="#059669" name="This month" />
          <Bar dataKey="previous" fill="#94a3b8" name="Prev month" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AccountMovementChart({ accounts }) {
  const data = (accounts ?? []).map((a) => ({
    name: a.accountId?.slice(-4) ?? '—',
    net: a.netMovement,
  }));
  if (!data.length) return <p className="text-sm text-slate-500">No movements.</p>;
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="net" fill="#2563eb" name="Net" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
