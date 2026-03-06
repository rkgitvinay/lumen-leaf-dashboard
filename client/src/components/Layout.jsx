import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, IndianRupee, Wrench, Users, ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/properties', label: 'Properties', icon: Building2 },
  { to: '/financials', label: 'Financials', icon: IndianRupee },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/partners', label: 'Partners', icon: Users },
  { to: '/sla', label: 'SLA Performance', icon: ShieldCheck },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-4">
        <div className="text-lg font-bold text-white mb-1">
          Lumen <span className="text-teal-400">Leaf</span>
        </div>
        <div className="text-[10px] text-white/40">Properties Dashboard</div>
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5">
        <div className="border-t border-white/10 pt-4 mb-3">
          <div className="px-3 text-sm text-white/80 font-medium">{user?.name || 'Admin'}</div>
          <div className="px-3 text-xs text-white/40">{user?.email}</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0 bg-[#0A0F1E] border-r border-white/5">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 bg-[#0A0F1E] shadow-2xl">{sidebar}</div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <button className="lg:hidden p-2 -ml-2 text-gray-600" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm text-gray-400 hidden lg:block">Lumen Leaf Properties — Admin Dashboard</div>
          <div className="text-xs text-gray-400">NCR Region</div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
