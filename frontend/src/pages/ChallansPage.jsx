import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ChallansPage = () => {
  const { user } = useAuth();
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const canCreate = ['Admin', 'Sales'].includes(user?.role);

  const fetchChallans = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      params.append('page', page);
      params.append('limit', 10);

      const res = await api.get(`/challans?${params.toString()}`);
      if (res.data.success) {
        setChallans(res.data.data.challans);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch sales challans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchChallans();
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Confirmed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Draft': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Sales Challans</h1>
          <p className="text-sm text-slate-400">Order delivery documents and two-stage stock confirmation engine</p>
        </div>
        {canCreate && (
          <Link
            to="/challans/new"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-colors shadow-lg shadow-emerald-600/20 inline-block text-center"
          >
            + Create Sales Challan
          </Link>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search by challan number, customer, or business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
          <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700">
            Search
          </button>
        </form>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading sales challans...</div>
        ) : challans.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No sales challans found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs font-semibold uppercase">
                <tr>
                  <th className="p-4">Challan Number</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total Qty</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-emerald-400">{ch.challan_number}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-100">{ch.customer_name}</div>
                      <div className="text-xs text-slate-400">{ch.business_name}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-100">{ch.total_quantity}</td>
                    <td className="p-4 font-medium text-slate-200">₹{parseFloat(ch.total_amount).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs rounded-md border font-semibold ${getStatusBadge(ch.status)}`}>
                        {ch.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400">{new Date(ch.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <Link to={`/challan/${ch.id}`} className="text-xs px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
                        View Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>Page {page} of {totalPages}</div>
          <div className="space-x-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded bg-slate-800 disabled:opacity-50 text-slate-300 border border-slate-700">Previous</button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded bg-slate-800 disabled:opacity-50 text-slate-300 border border-slate-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
