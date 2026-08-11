import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const InventoryPage = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('overview');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustData, setAdjustData] = useState({
    quantity_changed: '',
    movement_type: 'IN',
    reason: '',
  });
  const [adjustError, setAdjustError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canAdjust = ['Admin', 'Warehouse'].includes(user?.role);

  const fetchInventoryData = async () => {
    setLoading(true);
    setError('');
    try {
      const invRes = await api.get(`/inventory?lowStock=${lowStockFilter}`);
      setInventory(invRes.data.data.products);

      const movRes = await api.get('/inventory/0/movements');
      setMovements(movRes.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [lowStockFilter]);

  const handleOpenAdjustModal = (prod) => {
    setSelectedProduct(prod);
    setAdjustData({ quantity_changed: '', movement_type: 'IN', reason: '' });
    setAdjustError('');
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setAdjustError('');

    const qty = parseInt(adjustData.quantity_changed, 10);
    if (isNaN(qty) || qty <= 0) {
      setAdjustError('Quantity must be greater than 0');
      return;
    }

    if (adjustData.movement_type === 'OUT' && selectedProduct.current_stock < qty) {
      if (!window.confirm(`Warning: Stock for ${selectedProduct.product_name} is ${selectedProduct.current_stock}. Reducing by ${qty} will fail unless stock is sufficient. Proceed?`)) {
        return;
      }
    }

    setSubmitting(true);

    try {
      await api.post(`/inventory/${selectedProduct.id}/adjust`, {
        quantity_changed: qty,
        movement_type: adjustData.movement_type,
        reason: adjustData.reason,
      });

      setShowAdjustModal(false);
      fetchInventoryData();
    } catch (err) {
      setAdjustError(err.response?.data?.error || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Stock & Inventory Management</h1>
          <p className="text-sm text-slate-400">Warehouse stock levels, low-stock threshold alerts, and movement audit logs</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Inventory Overview
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'movements' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock Level Controls</span>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockFilter}
                onChange={(e) => setLowStockFilter(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-indigo-500"
              />
              Show Low-Stock Alerts Only
            </label>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading stock data...</div>
            ) : inventory.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No inventory records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs font-semibold uppercase">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">SKU</th>
                      <th className="p-4">Current Stock</th>
                      <th className="p-4">Min Alert Threshold</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Stock Status</th>
                      {canAdjust && <th className="p-4 text-right">Adjustment</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {inventory.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 font-semibold text-slate-100">{prod.product_name}</td>
                        <td className="p-4 text-xs font-mono text-indigo-400">{prod.sku}</td>
                        <td className="p-4 font-bold text-slate-100">{prod.current_stock}</td>
                        <td className="p-4 text-slate-400">{prod.min_stock_alert}</td>
                        <td className="p-4 text-xs text-slate-400">{prod.location}</td>
                        <td className="p-4">
                          {prod.is_low_stock ? (
                            <span className="px-2.5 py-1 text-xs rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                              Low Stock Warning
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 text-xs rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                              Sufficient
                            </span>
                          )}
                        </td>
                        {canAdjust && (
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleOpenAdjustModal(prod)}
                              className="text-xs px-2.5 py-1.5 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium"
                            >
                              Adjust Stock
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Complete Stock Movement Audit Log
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading audit logs...</div>
          ) : movements.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No stock movements recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs font-semibold uppercase">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Product / SKU</th>
                    <th className="p-4">Direction</th>
                    <th className="p-4">Magnitude</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 text-xs text-slate-400">{new Date(m.created_at).toLocaleString()}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-100">{m.product_name}</div>
                        <div className="text-xs font-mono text-indigo-400">{m.sku}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${m.movement_type === 'IN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                          {m.movement_type}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-100">{m.quantity_changed}</td>
                      <td className="p-4 text-xs text-slate-300">{m.reason}</td>
                      <td className="p-4 text-xs text-slate-400">{m.created_by_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showAdjustModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-lg font-bold text-slate-100 mb-1">Adjust Stock Level</h2>
            <p className="text-xs text-slate-400 mb-4">{selectedProduct?.product_name} (Current Stock: {selectedProduct?.current_stock})</p>

            {adjustError && <div className="mb-4 p-3 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-xs">{adjustError}</div>}

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Movement Type *</label>
                <select
                  value={adjustData.movement_type}
                  onChange={(e) => setAdjustData({ ...adjustData, movement_type: e.target.value })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100"
                >
                  <option value="IN">IN (+ Stock Addition)</option>
                  <option value="OUT">OUT (- Stock Reduction)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Quantity Magnitude *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustData.quantity_changed}
                  onChange={(e) => setAdjustData({ ...adjustData, quantity_changed: e.target.value })}
                  placeholder="e.g. 10"
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Reason / Note *</label>
                <input
                  type="text"
                  required
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  placeholder="e.g. Supplier Shipment / Damaged Audit"
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowAdjustModal(false)} className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-sm">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50">
                  {submitting ? 'Processing...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
