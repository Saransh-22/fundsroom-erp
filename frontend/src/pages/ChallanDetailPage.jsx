import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ChallanDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const canConfirm = ['Admin', 'Sales'].includes(user?.role);

  const fetchChallan = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/challans/${id}`);
      if (res.data.success) {
        setChallan(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load sales challan details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleConfirmChallan = async () => {
    if (!window.confirm(`Are you sure you want to CONFIRM challan ${challan.challan_number}? This will permanently reduce product inventory stock in an atomic PostgreSQL transaction.`)) {
      return;
    }

    setActionError('');
    setActionSuccess('');
    setConfirming(true);

    try {
      const res = await api.post(`/challans/${id}/confirm`);
      if (res.data.success) {
        setActionSuccess(`Sales Challan ${challan.challan_number} confirmed successfully! Inventory has been updated.`);
        setChallan(res.data.data);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to confirm challan');
    } finally {
      setConfirming(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Confirmed': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Draft': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  if (loading) return <div className="text-slate-400">Loading sales challan details...</div>;
  if (error) return <div className="p-4 rounded bg-red-500/10 text-red-400 border border-red-500/20">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/challans" className="text-xs text-indigo-400 hover:underline mb-1 inline-block">← Back to Challans List</Link>
          <h1 className="text-2xl font-bold font-mono text-emerald-400">{challan?.challan_number}</h1>
          <p className="text-sm text-slate-400">Customer: {challan?.customer_name} ({challan?.business_name})</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusBadge(challan?.status)}`}>
            {challan?.status}
          </span>
          {challan?.status === 'Draft' && canConfirm && (
            <button
              onClick={handleConfirmChallan}
              disabled={confirming}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 shadow-lg shadow-emerald-600/20"
            >
              {confirming ? 'Confirming...' : '✓ Confirm & Reduce Stock'}
            </button>
          )}
        </div>
      </div>

      {actionError && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{actionError}</div>}
      {actionSuccess && <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{actionSuccess}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 text-sm">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Created By</span>
          <span className="font-semibold text-slate-200">{challan?.created_by_name}</span>
        </div>
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Creation Date</span>
          <span className="font-semibold text-slate-200">{new Date(challan?.created_at).toLocaleString()}</span>
        </div>
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Confirmed Timestamp</span>
          <span className="font-semibold text-slate-200">{challan?.confirmed_at ? new Date(challan.confirmed_at).toLocaleString() : 'N/A (Draft Status)'}</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Line Items (Historical Product Snapshots)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs font-semibold uppercase">
              <tr>
                <th className="p-4">Snapshot Product</th>
                <th className="p-4">Snapshot SKU</th>
                <th className="p-4">Snapshot Unit Price</th>
                <th className="p-4">Quantity</th>
                <th className="p-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {challan?.items?.map((it) => (
                <tr key={it.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-semibold text-slate-100">{it.snapshot_product_name}</td>
                  <td className="p-4 text-xs font-mono text-indigo-400">{it.snapshot_sku}</td>
                  <td className="p-4">₹{parseFloat(it.snapshot_unit_price).toFixed(2)}</td>
                  <td className="p-4 font-bold text-slate-100">{it.quantity}</td>
                  <td className="p-4 text-right font-medium text-slate-200">₹{parseFloat(it.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-sm">
          <span className="text-slate-400">Total Quantity: <strong className="text-slate-200">{challan?.total_quantity}</strong></span>
          <span className="text-slate-400">Grand Total: <strong className="text-lg text-emerald-400">₹{parseFloat(challan?.total_amount || 0).toFixed(2)}</strong></span>
        </div>
      </div>
    </div>
  );
};
