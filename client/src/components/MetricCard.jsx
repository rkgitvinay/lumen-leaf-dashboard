export default function MetricCard({ label, value, sub, icon: Icon, trend, color = 'teal' }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${colors[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {(sub || trend) && (
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span className={trend > 0 ? 'text-emerald-600' : 'text-red-500'}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
          {sub && <span className="text-gray-400">{sub}</span>}
        </div>
      )}
    </div>
  );
}
