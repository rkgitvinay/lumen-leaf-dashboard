import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { api } from '../lib/api';

const STATUS_STYLES = {
  occupied: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  vacant: 'bg-amber-50 text-amber-700 border-amber-200',
  maintenance: 'bg-red-50 text-red-700 border-red-200',
};

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ area: '', status: '', type: '', search: '' });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.area) params.area = filters.area;
    if (filters.status) params.status = filters.status;
    if (filters.type) params.type = filters.type;
    if (filters.search) params.search = filters.search;
    api.getProperties(params).then(d => { setProperties(d); setLoading(false); });
  }, [filters]);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Properties</h1>
        <p className="text-sm text-gray-400 mt-1">{properties.length} properties under management</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties, owners, tenants…"
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
          />
        </div>
        {[
          { key: 'area', label: 'Area', options: ['Gurgaon', 'Noida', 'Greater Noida', 'Faridabad', 'Ghaziabad'] },
          { key: 'status', label: 'Status', options: ['occupied', 'vacant', 'maintenance'] },
          { key: 'type', label: 'Type', options: ['1BHK', '2BHK', '3BHK'] },
        ].map(f => (
          <select
            key={f.key}
            value={filters[f.key]}
            onChange={(e) => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
            className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          >
            <option value="">All {f.label}s</option>
            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Property</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Area</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Rent</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Tenant</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Lease End</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading…</td></tr>
              ) : properties.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No properties found</td></tr>
              ) : properties.map(p => (
                <tr
                  key={p._id}
                  onClick={() => navigate(`/properties/${p._id}`)}
                  className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{p.address.split(',')[0]}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{p.ownerName} · {p.ownerType}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.area}</td>
                  <td className="px-4 py-3 text-gray-600">{p.type}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">₹{p.monthlyRent.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.tenantName || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {p.leaseEnd ? new Date(p.leaseEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
