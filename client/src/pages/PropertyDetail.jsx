import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';

const VERIFY_BADGE = {
  verified: { icon: CheckCircle, cls: 'text-emerald-500', label: 'Verified' },
  pending: { icon: Clock, cls: 'text-amber-500', label: 'Pending' },
  not_started: { icon: AlertCircle, cls: 'text-gray-400', label: 'Not Started' },
};

export default function PropertyDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => { api.getProperty(id).then(setData); }, [id]);

  if (!data) return <div className="animate-pulse text-gray-400 p-8">Loading property…</div>;

  const v = VERIFY_BADGE[data.verificationStatus] || VERIFY_BADGE.not_started;
  const VIcon = v.icon;

  // Build 12-month rent chart
  const rentByMonth = {};
  data.transactions.filter(t => t.type === 'rent_collected').forEach(t => {
    const d = new Date(t.date);
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    rentByMonth[key] = (rentByMonth[key] || 0) + t.amount;
  });
  const rentChart = Object.entries(rentByMonth).map(([month, amount]) => ({ month, amount }));

  return (
    <div className="animate-fade-in space-y-6">
      <Link to="/properties" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to Properties
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Property info */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{data.address}</h2>
          <p className="text-sm text-gray-400 mb-4">{data.area} · {data.type} · {data.sizeSqft} sqft</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Monthly Rent</span><span className="font-medium text-gray-900">₹{data.monthlyRent.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Security Deposit</span><span className="text-gray-700">₹{data.securityDeposit.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="capitalize text-gray-700">{data.status}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Managed Since</span><span className="text-gray-700">{new Date(data.managedSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span></div>
          </div>
          <hr className="my-4 border-gray-100" />
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Owner</h3>
          <div className="text-sm space-y-1">
            <div className="font-medium text-gray-800">{data.ownerName}</div>
            <div className="text-gray-500">{data.ownerType} · {data.ownerPhone}</div>
          </div>
          {data.referredBy && (
            <>
              <hr className="my-4 border-gray-100" />
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Referred By</h3>
              <div className="text-sm text-gray-700">{data.referredBy.name} — {data.referredBy.area}</div>
            </>
          )}
        </div>

        {/* Tenant info */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tenant Details</h3>
          {data.tenantName ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                  {data.tenantName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{data.tenantName}</div>
                  <div className="flex items-center gap-1 text-xs">
                    <VIcon className={`w-3.5 h-3.5 ${v.cls}`} />
                    <span className={v.cls}>{v.label}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="text-gray-700">{data.tenantPhone}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Move-in</span><span className="text-gray-700">{new Date(data.moveInDate).toLocaleDateString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Lease End</span><span className="text-gray-700">{new Date(data.leaseEnd).toLocaleDateString('en-IN')}</span></div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No tenant currently assigned</p>
          )}

          <hr className="my-4 border-gray-100" />
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Financial Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total Collected</span><span className="text-emerald-600 font-medium">₹{data.financials.totalCollected.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total Expenses</span><span className="text-red-500">₹{data.financials.totalExpenses.toLocaleString()}</span></div>
            <div className="flex justify-between border-t border-gray-100 pt-2"><span className="text-gray-700 font-medium">Net Income</span><span className="text-gray-900 font-bold">₹{data.financials.net.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Rent chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Rent Collection</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rentChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              <Bar dataKey="amount" fill="#0D7377" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Maintenance history */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Maintenance History ({data.maintenanceTickets.length} tickets)</h3>
        {data.maintenanceTickets.length === 0 ? (
          <p className="text-gray-400 text-sm">No maintenance tickets</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="text-left px-3 py-2 font-medium">Issue</th>
                  <th className="text-left px-3 py-2 font-medium">Category</th>
                  <th className="text-center px-3 py-2 font-medium">Priority</th>
                  <th className="text-center px-3 py-2 font-medium">Status</th>
                  <th className="text-left px-3 py-2 font-medium">Vendor</th>
                  <th className="text-right px-3 py-2 font-medium">Cost</th>
                  <th className="text-right px-3 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.maintenanceTickets.map(t => (
                  <tr key={t._id} className="border-b border-gray-50">
                    <td className="px-3 py-2 text-gray-700">{t.description}</td>
                    <td className="px-3 py-2 capitalize text-gray-500">{t.category}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`text-xs font-medium ${t.priority === 'emergency' ? 'text-red-600' : t.priority === 'high' ? 'text-amber-600' : 'text-gray-500'}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center capitalize text-xs">{t.status.replace('_', ' ')}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{t.vendor}</td>
                    <td className="px-3 py-2 text-right text-gray-700">₹{(t.cost || 0).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-gray-400 text-xs">{new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
