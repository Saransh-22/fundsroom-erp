import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
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
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (testEmail, testPass) => {
    setEmail(testEmail);
    setPassword(testPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 antialiased">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-2xl mx-auto mb-4 shadow-xl shadow-indigo-600/30">
            F
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Fundsroom ERP</h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Enterprise Wholesale & Distribution Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@fundsroom.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.99] cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
            Quick Demo Test Profiles
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('admin@fundsroom.com', 'Admin@123')}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 hover:border-indigo-500/40 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-indigo-400">Admin</div>
              <div className="text-[11px] text-slate-400 truncate">admin@fundsroom.com</div>
            </button>
            <button
              onClick={() => handleQuickLogin('sales@fundsroom.com', 'Sales@123')}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 hover:border-blue-500/40 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-blue-400">Sales</div>
              <div className="text-[11px] text-slate-400 truncate">sales@fundsroom.com</div>
            </button>
            <button
              onClick={() => handleQuickLogin('warehouse@fundsroom.com', 'Warehouse@123')}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 hover:border-amber-500/40 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-amber-400">Warehouse</div>
              <div className="text-[11px] text-slate-400 truncate">warehouse@...</div>
            </button>
            <button
              onClick={() => handleQuickLogin('accounts@fundsroom.com', 'Accounts@123')}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 hover:border-emerald-500/40 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-emerald-400">Accounts</div>
              <div className="text-[11px] text-slate-400 truncate">accounts@...</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
