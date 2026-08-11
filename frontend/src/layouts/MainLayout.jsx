import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const role = user?.role || 'Guest';

  const canSeeCRM = ['Admin', 'Sales', 'Accounts'].includes(role);
  const canSeeProducts = ['Admin', 'Sales', 'Warehouse', 'Accounts'].includes(role);
  const canSeeInventory = ['Admin', 'Sales', 'Warehouse', 'Accounts'].includes(role);
  const canSeeChallans = ['Admin', 'Sales', 'Accounts'].includes(role);

  const getBadgeStyle = (r) => {
    switch (r) {
      case 'Admin': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'Sales': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Warehouse': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Accounts': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 shadow-xl z-20">
        <div>
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-600/30 shrink-0">
              F
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-100 text-base leading-tight tracking-wide truncate">Fundsroom ERP</h1>
              <p className="text-xs text-slate-400 font-medium truncate">Operations Portal</p>
            </div>
          </div>

          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Main Navigation
          </div>

          <nav className="space-y-1">
            <Link
              to="/dashboard"
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/dashboard')
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              Dashboard
            </Link>

            {canSeeCRM && (
              <Link
                to="/customers"
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive('/customers') || isActive('/customer')
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                Customer CRM
              </Link>
            )}

            {canSeeProducts && (
              <Link
                to="/products"
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive('/products')
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                Products Catalog
              </Link>
            )}

            {canSeeInventory && (
              <Link
                to="/inventory"
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive('/inventory')
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                Inventory Control
              </Link>
            )}

            {canSeeChallans && (
              <Link
                to="/challans"
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive('/challans') || isActive('/challan')
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                Sales Challans
              </Link>
            )}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/80">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Account Profile
          </div>
          <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <div className="truncate mr-2">
              <div className="text-xs font-semibold text-slate-200 truncate">{user?.name}</div>
              <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
            </div>
            <span className={`px-2 py-0.5 text-[10px] rounded border font-bold uppercase tracking-wider shrink-0 ${getBadgeStyle(role)}`}>
              {role}
            </span>
          </div>
          <button
            onClick={logout}
            className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800/80 text-slate-300 hover:bg-red-500/15 hover:text-red-300 border border-slate-700/60 hover:border-red-500/30 transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-950">
        <header className="h-16 bg-slate-900/60 border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span className="text-slate-200 font-semibold">Fundsroom Enterprise</span>
            <span>/</span>
            <span className="capitalize">{location.pathname.split('/')[1] || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              API Connected
            </span>
          </div>
        </header>

        <div className="p-6 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
