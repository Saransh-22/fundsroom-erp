import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    category: '',
    unit_price: '',
    current_stock: '',
    min_stock_alert: '5',
    location: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canEdit = ['Admin', 'Warehouse'].includes(user?.role);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (lowStock) params.append('lowStock', 'true');
      params.append('page', page);
      params.append('limit', 10);

      const res = await api.get(`/products?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.data.products);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, category, lowStock]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      product_name: '',
      sku: '',
      category: '',
      unit_price: '',
      current_stock: '',
      min_stock_alert: '5',
      location: '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      product_name: prod.product_name || '',
      sku: prod.sku || '',
      category: prod.category || '',
      unit_price: prod.unit_price || '',
      current_stock: prod.current_stock || '',
      min_stock_alert: prod.min_stock_alert || '5',
      location: prod.location || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        unit_price: parseFloat(formData.unit_price),
        current_stock: parseInt(formData.current_stock, 10),
        min_stock_alert: parseInt(formData.min_stock_alert, 10),
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Products Catalog</h1>
          <p className="text-sm text-slate-400">Inventory SKU specifications and pricing catalog</p>
        </div>
        {canEdit && (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg text-sm transition-colors shadow-lg shadow-amber-600/20"
          >
            + Add New Product
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search by product name, SKU, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          />
          <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700">
            Search
          </button>
        </form>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Filter Category"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none"
          />
          <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={lowStock}
              onChange={(e) => { setLowStock(e.target.checked); setPage(1); }}
              className="rounded bg-slate-900 border-slate-700 text-amber-500"
            />
            Low Stock Only
          </label>
        </div>
      </div>

      {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading catalog items...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs font-semibold uppercase">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Unit Price</th>
                  <th className="p-4">Stock Level</th>
                  <th className="p-4">Warehouse Location</th>
                  {canEdit && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-100">{prod.product_name}</td>
                    <td className="p-4 text-xs font-mono text-indigo-400">{prod.sku}</td>
                    <td className="p-4">{prod.category}</td>
                    <td className="p-4 font-medium text-slate-200">₹{parseFloat(prod.unit_price).toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${prod.is_low_stock ? 'text-amber-400' : 'text-slate-100'}`}>
                          {prod.current_stock}
                        </span>
                        {prod.is_low_stock && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                            LOW ALERT (&lt;={prod.min_stock_alert})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-400">{prod.location}</td>
                    {canEdit && (
                      <td className="p-4 text-right">
                        <button onClick={() => handleOpenEditModal(prod)} className="text-xs px-2.5 py-1.5 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30">
                          Edit
                        </button>
                      </td>
                    )}
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

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h2 className="text-lg font-bold text-slate-100 mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            {formError && <div className="mb-4 p-3 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-xs">{formError}</div>}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Product Name *</label>
                  <input type="text" required value={formData.product_name} onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">SKU / Code *</label>
                  <input type="text" required value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category *</label>
                  <input type="text" required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Unit Price (₹) *</label>
                  <input type="number" step="0.01" min="0" required value={formData.unit_price} onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Current Stock *</label>
                  <input type="number" min="0" required value={formData.current_stock} onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Min Stock Alert *</label>
                  <input type="number" min="0" required value={formData.min_stock_alert} onChange={(e) => setFormData({ ...formData, min_stock_alert: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Location *</label>
                  <input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-sm">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-amber-600 text-white text-sm font-medium hover:bg-amber-500 disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
