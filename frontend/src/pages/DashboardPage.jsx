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
        <h1 className="text-2xl font-bold text-slate-100">Executive Overview</h1>
        <p className="text-sm text-slate-400">Welcome back, {user?.name} ({user?.role})</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Admin', 'Sales', 'Accounts'].includes(user?.role) && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Customers</div>
            <div className="text-3xl font-bold text-slate-100">{stats.customers}</div>
            <Link to="/customers" className="text-xs text-indigo-400 hover:underline mt-3 inline-block">
              View CRM →
            </Link>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Active Products</div>
          <div className="text-3xl font-bold text-slate-100">{stats.products}</div>
          <Link to="/products" className="text-xs text-indigo-400 hover:underline mt-3 inline-block">
            View Catalog →
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Low-Stock Items</div>
          <div className="text-3xl font-bold text-amber-400">{stats.lowStock}</div>
          <Link to="/inventory?lowStock=true" className="text-xs text-amber-400 hover:underline mt-3 inline-block">
            Review Alerts →
          </Link>
        </div>

        {['Admin', 'Sales', 'Accounts'].includes(user?.role) && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Sales Challans</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-100">{stats.confirmedChallans}</span>
              <span className="text-xs text-slate-400">Confirmed</span>
              <span className="text-sm font-semibold text-amber-400 ml-2">({stats.draftChallans} Draft)</span>
            </div>
            <Link to="/challans" className="text-xs text-indigo-400 hover:underline mt-3 inline-block">
              Manage Orders →
            </Link>
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-3">Quick Operational Actions</h2>
        <div className="flex flex-wrap gap-3">
          {['Admin', 'Sales'].includes(user?.role) && (
            <Link to="/customers" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
              + Add New Customer
            </Link>
          )}
          {['Admin', 'Warehouse'].includes(user?.role) && (
            <Link to="/products" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors">
              + Add New Product
            </Link>
          )}
          {['Admin', 'Sales'].includes(user?.role) && (
            <Link to="/challans/new" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">
              + Create Sales Challan
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
