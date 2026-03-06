import { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, AlertTriangle, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import MetricCard from '../components/MetricCard';
import { api } from '../lib/api';

const EXPENSE_COLORS = ['#0D7377', '#F4A300', '#1B3A6B', '#EF4444'];

function formatINR(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export default function Financials() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTransactionSummary().then(d => { setSummary(d); setLoading(false); });
  }, []);

  if (loading) return <div className="animate-pulse text-gray-400 p-8">Loading financials…</div>;

  const totalPaid = summary.reduce((s, m) => s + m.paid, 0);
  const totalExpenses = summary.reduce((s, m) => s + m.expenses, 0);
  const totalPending = summary.reduce((s, m) => s + m.pending, 0);
  const totalOverdue = summary.reduce((s, m) => s + m.overdue, 0);
  const avgCollection = summary.length > 0
    ? (summary.reduce((s, m) => s + m.collectionRate, 0) / summary.length).toFixed(1)
    : 0;

  const expenseBreakdown = [
    { name: 'Maintenance', value: totalExpenses },
    { name: 'Placement Fees', value: summary.reduce((s, m) => s + m.placement, 0) },
  ].filter(e => e.value > 0);

  const collectionTrend = summary.map(m => ({ month: m.month, rate: m.collectionRate }));

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Financial Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Revenue, expenses, and collection analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Revenue" value={formatINR(totalPaid)} icon={IndianRupee} color="green" sub="Rent collected (YTD)" />
        <MetricCard label="Total Expenses" value={formatINR(totalExpenses)} icon={ArrowDownRight} color="red" sub="Maintenance costs" />
        <MetricCard label="Avg Collection Rate" value={`${avgCollection}%`} icon={TrendingUp} color="blue" sub="Across all months" />
        <MetricCard label="Outstanding" value={formatINR(totalPending + totalOverdue)} icon={AlertTriangle} color="amber" sub={`₹${totalOverdue.toLocaleString()} overdue`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue vs Expenses (Monthly)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              <Bar dataKey="paid" name="Revenue" fill="#0D7377" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#F4A300" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={expenseBreakdown} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {expenseBreakdown.map((_, i) => <Cell key={i} fill={EXPENSE_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {expenseBreakdown.map((e, i) => (
              <div key={e.name} className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EXPENSE_COLORS[i] }} />
                  {e.name}
                </span>
                <span className="font-medium text-gray-700">{formatINR(e.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Collection rate trend */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Collection Rate Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={collectionTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis domain={[80, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Line type="monotone" dataKey="rate" stroke="#0D7377" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
