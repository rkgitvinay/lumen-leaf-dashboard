import { useState, useEffect } from 'react';
import { Building2, TrendingUp, Percent, Wrench, Users, IndianRupee } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MetricCard from '../components/MetricCard';
import { api } from '../lib/api';

const STATUS_COLORS = { occupied: '#0D7377', vacant: '#F4A300', maintenance: '#EF4444' };

function formatINR(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export default function Overview() {
  const [data, setData] = useState(null);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    api.getOverview().then(setData);
    api.getRevenueTrend().then(setTrend);
  }, []);

  if (!data) return <div className="animate-pulse text-gray-400 p-8">Loading dashboard…</div>;

  const statusData = [
    { name: 'Occupied', value: data.occupied, color: STATUS_COLORS.occupied },
    { name: 'Vacant', value: data.vacant, color: STATUS_COLORS.vacant },
    { name: 'Maintenance', value: data.maintenance, color: STATUS_COLORS.maintenance },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Portfolio performance at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Properties" value={data.totalProperties} icon={Building2} color="teal" sub="Under management" />
        <MetricCard label="Occupancy Rate" value={`${data.occupancyRate}%`} icon={Percent} color="green" sub={`${data.occupied} occupied`} />
        <MetricCard label="Monthly Revenue" value={formatINR(data.monthlyRevenue)} icon={IndianRupee} color="amber" sub="This month" />
        <MetricCard label="Collection Rate" value={`${data.collectionRate}%`} icon={TrendingUp} color="blue" sub="Paid on time" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue Trend (12 months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip formatter={(v) => formatINR(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#0D7377" fill="#0D7377" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#F4A300" fill="#F4A300" fillOpacity={0.05} strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Property status donut */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Property Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick stats + activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <MetricCard label="Open Tickets" value={data.openTickets} icon={Wrench} color="red" sub="Maintenance" />
          <MetricCard label="Active Partners" value={data.activeBrokers} icon={Users} color="teal" sub="Brokers" />
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data.activity.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                <div className="flex-1 min-w-0">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    a.type === 'rent_collected' ? 'bg-emerald-400' :
                    a.type === 'maintenance_expense' ? 'bg-amber-400' :
                    a.type === 'maintenance' ? 'bg-red-400' : 'bg-blue-400'
                  }`} />
                  <span className="text-gray-700">{a.description}</span>
                  {a.property && <span className="text-gray-400 ml-1 text-xs">— {a.property}</span>}
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  {a.amount > 0 && <div className="font-medium text-gray-700">₹{a.amount.toLocaleString()}</div>}
                  <div className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
