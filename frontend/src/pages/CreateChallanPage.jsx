import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export const CreateChallanPage = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [status, setStatus] = useState('Draft');

  const [items, setItems] = useState([
    { product_id: '', quantity: 1 },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const loadFormData = async () => {
      setLoading(true);
      setError('');
      try {
        const custRes = await api.get('/customers?limit=100');
        setCustomers(custRes.data.data.customers);

        const prodRes = await api.get('/products?limit=100');
        setProducts(prodRes.data.data.products);
      } catch (err) {
        setError('Failed to load required customers or products data');
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const getProductDetails = (prodId) => {
    return products.find((p) => p.id === parseInt(prodId, 10));
  };

  const calculateTotals = () => {
    let totalQty = 0;
    let totalAmt = 0;

    items.forEach((it) => {
      const prod = getProductDetails(it.product_id);
      const q = parseInt(it.quantity, 10) || 0;
      if (prod && q > 0) {
        totalQty += q;
        totalAmt += parseFloat(prod.unit_price) * q;
      }
    });

    return { totalQty, totalAmt };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!selectedCustomerId) {
      setSubmitError('Please select a customer');
      return;
    }

    const formattedItems = [];
    const usedProductIds = new Set();

    for (const it of items) {
      const pId = parseInt(it.product_id, 10);
      const qty = parseInt(it.quantity, 10);

      if (!pId) {
        setSubmitError('Please select a valid product for all item rows');
        return;
      }
      if (isNaN(qty) || qty <= 0) {
        setSubmitError('Quantity must be greater than zero for all items');
        return;
      }
      if (usedProductIds.has(pId)) {
        setSubmitError('Duplicate product selected. Please combine quantities into a single row.');
        return;
      }

      usedProductIds.add(pId);
      formattedItems.push({ product_id: pId, quantity: qty });
    }

    setSubmitting(true);

    try {
      const res = await api.post('/challans', {
        customer_id: parseInt(selectedCustomerId, 10),
        items: formattedItems,
        status: status,
      });

      if (res.data.success) {
        navigate(`/challan/${res.data.data.id}`);
      }
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to generate sales challan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-slate-400">Loading order form resources...</div>;
  if (error) return <div className="p-4 rounded bg-red-500/10 text-red-400 border border-red-500/20">{error}</div>;

  const { totalQty, totalAmt } = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/challans" className="text-xs text-indigo-400 hover:underline mb-1 inline-block">← Back to Challans List</Link>
        <h1 className="text-2xl font-bold text-slate-100">Create Sales Challan</h1>
        <p className="text-sm text-slate-400">Generate a multi-product delivery document (Draft or Confirmed)</p>
      </div>

      {submitError && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{submitError}</div>}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Select Customer *</label>
            <select
              required
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customer_name} ({c.business_name}) - {c.customer_type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Initial Order Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="Draft">Draft (No immediate stock deduction)</option>
              <option value="Confirmed">Confirmed (Deducts stock immediately inside atomic transaction)</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Line Items Selection</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-medium rounded-lg border border-slate-700"
            >
              + Add Product Line
            </button>
          </div>

          {items.map((it, idx) => {
            const prod = getProductDetails(it.product_id);
            const unitPrice = prod ? parseFloat(prod.unit_price) : 0;
            const subtotal = unitPrice * (parseInt(it.quantity, 10) || 0);

            return (
              <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-800/40 border border-slate-800 rounded-lg">
                <div className="flex-1 w-full">
                  <select
                    required
                    value={it.product_id}
                    onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-100"
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.product_name} ({p.sku}) - Available Stock: {p.current_stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-28">
                  <input
                    type="number"
                    min="1"
                    required
                    value={it.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    placeholder="Qty"
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-100 text-center"
                  />
                </div>

                <div className="w-full sm:w-36 text-right text-xs">
                  <div className="text-slate-400">Unit: ₹{unitPrice.toFixed(2)}</div>
                  <div className="font-semibold text-slate-200">Sub: ₹{subtotal.toFixed(2)}</div>
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Estimated Summary</span>
            <span className="text-sm font-bold text-slate-200">{totalQty} Total Items</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Amount</span>
            <span className="text-xl font-bold text-emerald-400">₹{totalAmt.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/challans" className="px-5 py-2.5 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm disabled:opacity-50 transition-colors shadow-lg shadow-emerald-600/20"
          >
            {submitting ? 'Generating...' : `Save as ${status}`}
          </button>
        </div>
      </form>
    </div>
  );
};
