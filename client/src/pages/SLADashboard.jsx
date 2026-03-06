import { useState, useEffect } from 'react';
import { api } from '../lib/api';

function ProgressRing({ value, target, label, unit, size = 140 }) {
  const pct = Math.min((value / target) * 100, 100);
  const isGood = unit.includes('day') || unit.includes('hr') ? value <= target : value >= target;
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = isGood ? '#0D7377' : '#F4A300';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#f1f5f9" strokeWidth="8" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth="8" fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="text-center -mt-[calc(50%+14px)] mb-8">
        <div className="text-2xl font-bold text-gray-900">{value}{unit}</div>
        <div className="text-xs text-gray-400">target: {target}{unit}</div>
      </div>
      <div className="text-sm font-medium text-gray-700 mt-2">{label}</div>
      <div className={`text-xs mt-1 font-medium ${isGood ? 'text-emerald-600' : 'text-amber-600'}`}>
        {isGood ? 'Within SLA' : 'Needs attention'}
      </div>
    </div>
  );
}

export default function SLADashboard() {
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMaintenanceStats(), api.getOverview()])
      .then(([s, o]) => { setStats(s); setOverview(o); setLoading(false); });
  }, []);

  if (loading || !stats || !overview) return <div className="animate-pulse text-gray-400 p-8">Loading SLA data…</div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">SLA Performance</h1>
        <p className="text-sm text-gray-400 mt-1">Service level agreement compliance and accountability metrics</p>
      </div>

      {/* SLA compliance banner */}
      <div className="bg-gradient-to-r from-[#1B3A6B] to-[#0D7377] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs font-semibold tracking-wider text-white/50 uppercase mb-1">Overall SLA Compliance</div>
            <div className="text-4xl font-bold">{stats.slaCompliance}%</div>
            <div className="text-sm text-white/70 mt-1">Across all maintenance categories</div>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">{overview.totalProperties}</div>
              <div className="text-xs text-white/60">Properties</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{overview.occupancyRate}%</div>
              <div className="text-xs text-white/60">Occupancy</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{overview.collectionRate}%</div>
              <div className="text-xs text-white/60">Collection</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress rings */}
      <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-8 text-center">Key SLA Metrics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          <ProgressRing value={18} target={21} label="Tenant Placement" unit=" days" />
          <ProgressRing value={+stats.avgResponseTime} target={24} label="Maintenance Response" unit=" hrs" />
          <ProgressRing value={3.5} target={4} label="Emergency Dispatch" unit=" hrs" />
          <ProgressRing value={overview.collectionRate} target={95} label="Collection Rate" unit="%" />
        </div>
      </div>

      {/* Additional metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="text-xs font-medium text-gray-400 uppercase mb-2">Tenant Retention</div>
          <div className="text-3xl font-bold text-gray-900">89%</div>
          <div className="text-sm text-gray-500 mt-1">Tenants renewing lease</div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
            <div className="bg-teal-500 h-2 rounded-full" style={{ width: '89%' }} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="text-xs font-medium text-gray-400 uppercase mb-2">Owner NPS</div>
          <div className="text-3xl font-bold text-gray-900">72</div>
          <div className="text-sm text-gray-500 mt-1">Net Promoter Score</div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '72%' }} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="text-xs font-medium text-gray-400 uppercase mb-2">Avg Resolution Time</div>
          <div className="text-3xl font-bold text-gray-900">{stats.avgResponseTime} hrs</div>
          <div className="text-sm text-gray-500 mt-1">Across all categories</div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
            <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${Math.min((24 / stats.avgResponseTime) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* SLA definitions */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">SLA Definitions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { sla: 'Rent Reminder', target: 'D-7 before due date', status: 'Active' },
            { sla: 'Maintenance Ack', target: '24 hours', status: 'Active' },
            { sla: 'Emergency Dispatch', target: '4 hours', status: 'Active' },
            { sla: 'Lease Renewal Alert', target: '60 days prior', status: 'Active' },
            { sla: 'Tenant Placement', target: '21 days', status: 'Active' },
            { sla: 'Deposit Settlement', target: '15 days post-exit', status: 'Active' },
            { sla: 'Monthly Report', target: '5th of each month', status: 'Active' },
            { sla: 'Exit Inspection', target: '48 hours of notice', status: 'Active' },
          ].map(s => (
            <div key={s.sla} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-sm font-medium text-gray-700">{s.sla}</div>
              <div className="text-xs text-gray-500 mt-1">Target: {s.target}</div>
              <div className="text-xs text-emerald-600 font-medium mt-1">{s.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
