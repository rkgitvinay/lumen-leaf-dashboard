import { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MetricCard from '../components/MetricCard';
import { api } from '../lib/api';

const STATUS_STYLES = {
  open: 'bg-red-50 text-red-700 border-red-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const PRIORITY_STYLES = {
  emergency: 'text-red-600 font-semibold',
  high: 'text-amber-600',
  medium: 'text-gray-600',
  low: 'text-gray-400',
};

export default function MaintenancePage() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({ status: '', category: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = {};
    if (filter.status) params.status = filter.status;
    if (filter.category) params.category = filter.category;
    Promise.all([
      api.getMaintenanceTickets(params),
      api.getMaintenanceStats(),
    ]).then(([t, s]) => { setTickets(t); setStats(s); setLoading(false); });
  }, [filter]);

  if (loading || !stats) return <div className="animate-pulse text-gray-400 p-8">Loading maintenance…</div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Maintenance</h1>
        <p className="text-sm text-gray-400 mt-1">Ticket management and SLA tracking</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Open" value={stats.open} icon={AlertCircle} color="red" sub="Awaiting action" />
        <MetricCard label="In Progress" value={stats.inProgress} icon={Clock} color="amber" sub="Being resolved" />
        <MetricCard label="Resolved" value={stats.resolved} icon={CheckCircle2} color="green" sub="Completed" />
        <MetricCard label="SLA Compliance" value={`${stats.slaCompliance}%`} icon={ShieldCheck} color="teal" sub={`Avg response: ${stats.avgResponseTime}hrs`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Category breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">By Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.categories} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" width={80} />
              <Tooltip />
              <Bar dataKey="count" name="Tickets" fill="#0D7377" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ticket table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 pt-5 pb-3 flex items-center gap-3 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-700 mr-auto">Tickets ({tickets.length})</h3>
            <select
              value={filter.status}
              onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={filter.category}
              onChange={(e) => setFilter(f => ({ ...f, category: e.target.value }))}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none"
            >
              <option value="">All Categories</option>
              {stats.categories.map(c => <option key={c.category} value={c.category}>{c.category}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-sm">
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="text-left px-4 py-2 font-medium">Issue</th>
                  <th className="text-left px-4 py-2 font-medium">Property</th>
                  <th className="text-center px-4 py-2 font-medium">Priority</th>
                  <th className="text-center px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Vendor</th>
                  <th className="text-right px-4 py-2 font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5">
                      <div className="text-gray-700">{t.description}</div>
                      <div className="text-xs text-gray-400 capitalize">{t.category}</div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{t.propertyId?.name || '—'}</td>
                    <td className={`px-4 py-2.5 text-center text-xs capitalize ${PRIORITY_STYLES[t.priority]}`}>{t.priority}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[t.status]}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{t.vendor}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">₹{(t.cost || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
