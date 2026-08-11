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

  const getBadgeColor = (r) => {
    switch (r) {
      case 'Admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Sales': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Warehouse': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Accounts': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
              F
            </div>
            <div>
              <h1 className="font-bold text-slate-100 leading-tight">Fundsroom ERP</h1>
              <p className="text-xs text-slate-400">Operations Portal</p>
            </div>
          </div>

          <nav className="space-y-1">
            <Link
              to="/dashboard"
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              Dashboard
            </Link>

            {canSeeCRM && (
              <Link
                to="/customers"
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/customers') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Customer CRM
              </Link>
            )}

            {canSeeProducts && (
              <Link
                to="/products"
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/products') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Products
              </Link>
            )}

            {canSeeInventory && (
              <Link
                to="/inventory"
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/inventory') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Inventory
              </Link>
            )}

            {canSeeChallans && (
              <Link
                to="/challans"
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/challans') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Sales Challans
              </Link>
            )}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="truncate mr-2">
              <div className="text-sm font-medium text-slate-200 truncate">{user?.name}</div>
              <div className="text-xs text-slate-400 truncate">{user?.email}</div>
            </div>
            <span className={`px-2 py-0.5 text-xs rounded border font-semibold ${getBadgeColor(role)}`}>
              {role}
            </span>
          </div>
          <button
            onClick={logout}
            className="w-full py-2 px-3 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-red-500/20 hover:text-red-300 border border-slate-700 hover:border-red-500/30 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-slate-900/50 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
          <div className="text-sm text-slate-400">
            Enterprise Wholesale & Distribution Portal
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              System Online
            </span>
          </div>
        </header>

        <div className="p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
