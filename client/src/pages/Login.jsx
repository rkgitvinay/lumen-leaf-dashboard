import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import DemoBadge from '../components/DemoBadge';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.login(email, password);
      login(token, user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E] px-4 relative">
      <div className="absolute inset-0 opacity-30" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(13,115,119,0.25) 0%, transparent 60%)',
      }} />

      <div className="absolute top-6 right-6">
        <DemoBadge />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-white mb-1">
            Lumen <span className="text-teal-400">Leaf</span>
          </div>
          <div className="text-xs text-white/40 tracking-wider uppercase">Properties Dashboard</div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              placeholder="admin@lumenleaf.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm bg-amber-500 text-gray-900 hover:bg-amber-400 transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/30 text-xs mb-1">Demo credentials</p>
          <p className="text-white/50 text-xs font-mono">admin@lumenleaf.com / demo2025</p>
        </div>
      </div>
    </div>
  );
}
