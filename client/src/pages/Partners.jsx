import { useState, useEffect } from 'react';
import { Users, IndianRupee, Building2, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MetricCard from '../components/MetricCard';
import { api } from '../lib/api';

const MODEL_STYLES = {
  revenue_share: 'bg-teal-50 text-teal-700 border-teal-200',
  referral: 'bg-amber-50 text-amber-700 border-amber-200',
  area_partner: 'bg-blue-50 text-blue-700 border-blue-200',
};

const MODEL_LABELS = {
  revenue_share: 'Revenue Share',
  referral: 'Referral',
  area_partner: 'Area Partner',
};

function formatINR(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export default function Partners() {
  const [brokers, setBrokers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getBrokers(), api.getBrokerStats()])
      .then(([b, s]) => { setBrokers(b); setStats(s); setLoading(false); });
  }, []);

  if (loading || !stats) return <div className="animate-pulse text-gray-400 p-8">Loading partners…</div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Partner Network</h1>
        <p className="text-sm text-gray-400 mt-1">Broker partnerships and revenue sharing</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Active Partners" value={stats.active} icon={Users} color="teal" sub="Across NCR" />
        <MetricCard label="Properties Referred" value={stats.totalReferred} icon={Building2} color="blue" sub="Total referrals" />
        <MetricCard label="Revenue Shared" value={formatINR(stats.totalEarnings)} icon={IndianRupee} color="amber" sub="YTD payouts" />
        <MetricCard label="Avg per Partner" value={formatINR(Math.round(stats.totalEarnings / (stats.active || 1)))} icon={TrendingUp} color="green" sub="Annual earnings" />
      </div>

      {/* Revenue share trend */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue Share Disbursed (Monthly)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={stats.trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
            <Area type="monotone" dataKey="amount" stroke="#0D7377" fill="#0D7377" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Partner table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-gray-700">All Partners</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Partner</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Area</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Model</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Share %</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Properties</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Total Earnings</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">This Month</th>
              </tr>
            </thead>
            <tbody>
              {brokers.map(b => {
                const totalEarnings = b.monthlyEarnings.reduce((s, e) => s + e.amount, 0);
                const thisMonth = b.monthlyEarnings[b.monthlyEarnings.length - 1]?.amount || 0;
                return (
                  <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{b.name}</div>
                      <div className="text-xs text-gray-400">{b.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{b.area}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${MODEL_STYLES[b.partnerModel]}`}>
                        {MODEL_LABELS[b.partnerModel]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{b.revenueSharePercent > 0 ? `${b.revenueSharePercent}%` : '—'}</td>
                    <td className="px-4 py-3 text-center font-medium text-gray-800">{b.propertiesReferred}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">₹{totalEarnings.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">₹{thisMonth.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
