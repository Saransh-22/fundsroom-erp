import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    lowStock: 0,
    draftChallans: 0,
    confirmedChallans: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const role = user?.role;
        let custCount = 0;
        let prodCount = 0;
        let lowStockCount = 0;
        let draftCount = 0;
        let confCount = 0;

        if (['Admin', 'Sales', 'Accounts'].includes(role)) {
          const custRes = await api.get('/customers?limit=1');
          custCount = custRes.data.data.total;
        }

        if (['Admin', 'Sales', 'Warehouse', 'Accounts'].includes(role)) {
          const prodRes = await api.get('/products?limit=1');
          prodCount = prodRes.data.data.total;

          const lowStockRes = await api.get('/products?lowStock=true&limit=1');
          lowStockCount = lowStockRes.data.data.total;
        }

        if (['Admin', 'Sales', 'Accounts'].includes(role)) {
          const draftRes = await api.get('/challans?status=Draft&limit=1');
          draftCount = draftRes.data.data.total;

          const confRes = await api.get('/challans?status=Confirmed&limit=1');
          confCount = confRes.data.data.total;
        }

        setStats({
          customers: custCount,
          products: prodCount,
          lowStock: lowStockCount,
          draftChallans: draftCount,
          confirmedChallans: confCount,
        });
      } catch (err) {
        setError('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <div className="text-slate-400">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="p-4 rounded bg-red-500/10 text-red-400 border border-red-500/20">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Executive Overview</h1>
        <p className="text-sm text-slate-400">Operational performance metrics & summary for {user?.name} ({user?.role})</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Admin', 'Sales', 'Accounts'].includes(user?.role) && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-all group">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Customers</div>
            <div className="text-3xl font-black text-slate-100 group-hover:text-indigo-400 transition-colors">{stats.customers}</div>
            <Link to="/customers" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 mt-4 inline-flex items-center gap-1 transition-colors">
              <span>View Customer CRM</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        )}

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-all group">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active Catalog SKUs</div>
          <div className="text-3xl font-black text-slate-100 group-hover:text-indigo-400 transition-colors">{stats.products}</div>
          <Link to="/products" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 mt-4 inline-flex items-center gap-1 transition-colors">
            <span>Browse Catalog</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-all group">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Low-Stock Warnings</div>
          <div className="text-3xl font-black text-amber-400">{stats.lowStock}</div>
          <Link to="/inventory?lowStock=true" className="text-xs font-semibold text-amber-400 hover:text-amber-300 mt-4 inline-flex items-center gap-1 transition-colors">
            <span>Review Low Stock</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        {['Admin', 'Sales', 'Accounts'].includes(user?.role) && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-all group">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sales Challans Summary</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{stats.confirmedChallans}</span>
              <span className="text-xs text-slate-400 font-medium">Confirmed</span>
              <span className="text-xs font-bold text-amber-400 ml-1">({stats.draftChallans} Draft)</span>
            </div>
            <Link to="/challans" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 mt-4 inline-flex items-center gap-1 transition-colors">
              <span>Manage Sales Challans</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        )}
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-base font-bold text-slate-100 mb-1">Quick Operational Actions</h2>
        <p className="text-xs text-slate-400 mb-4">Shortcut actions tailored for your account role ({user?.role})</p>
        <div className="flex flex-wrap gap-3">
          {['Admin', 'Sales'].includes(user?.role) && (
            <Link to="/customers" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98]">
              + Add New Customer
            </Link>
          )}
          {['Admin', 'Warehouse'].includes(user?.role) && (
            <Link to="/products" className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-amber-600/20 active:scale-[0.98]">
              + Add New Product
            </Link>
          )}
          {['Admin', 'Sales'].includes(user?.role) && (
            <Link to="/challans/new" className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98]">
              + Create Sales Challan
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
