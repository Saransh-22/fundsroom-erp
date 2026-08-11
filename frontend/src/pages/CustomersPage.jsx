import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CustomersPage = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    mobile_number: '',
    email: '',
    business_name: '',
    gst_number: '',
    customer_type: 'Retail',
    address: '',
    status: 'Lead',
    follow_up_date: '',
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canEdit = ['Admin', 'Sales'].includes(user?.role);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (type) params.append('type', type);
      if (status) params.append('status', status);
      params.append('page', page);
      params.append('limit', 10);

      const res = await api.get(`/customers?${params.toString()}`);
      if (res.data.success) {
        setCustomers(res.data.data.customers);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, type, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setFormData({
      customer_name: '',
      mobile_number: '',
      email: '',
      business_name: '',
      gst_number: '',
      customer_type: 'Retail',
      address: '',
      status: 'Lead',
      follow_up_date: '',
      notes: '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      customer_name: cust.customer_name || '',
      mobile_number: cust.mobile_number || '',
      email: cust.email || '',
      business_name: cust.business_name || '',
      gst_number: cust.gst_number || '',
      customer_type: cust.customer_type || 'Retail',
      address: cust.address || '',
      status: cust.status || 'Lead',
      follow_up_date: cust.follow_up_date ? cust.follow_up_date.slice(0, 10) : '',
      notes: cust.notes || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Lead': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Inactive': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Customer CRM</h1>
          <p className="text-sm text-slate-400">Manage client profiles, lead status, and follow-ups</p>
        </div>
        {canEdit && (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-colors shadow-lg shadow-indigo-600/20"
          >
            + Add New Customer
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search by name, business, email or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700">
            Search
          </button>
        </form>

        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Distributor">Distributor</option>
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading customer records...</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No customers found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs font-semibold uppercase">
                <tr>
                  <th className="p-4">Customer / Business</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Follow-up</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-100">{cust.customer_name}</div>
                      <div className="text-xs text-slate-400">{cust.business_name}</div>
                    </td>
                    <td className="p-4">
                      <div>{cust.mobile_number}</div>
                      <div className="text-xs text-slate-400">{cust.email}</div>
                    </td>
                    <td className="p-4">{cust.customer_type}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs rounded-md border font-medium ${getStatusBadge(cust.status)}`}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {cust.follow_up_date ? new Date(cust.follow_up_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link to={`/customer/${cust.id}`} className="text-xs px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
                        View & Notes
                      </Link>
                      {canEdit && (
                        <button onClick={() => handleOpenEditModal(cust)} className="text-xs px-2.5 py-1.5 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                          Edit
                        </button>
                      )}
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
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded bg-slate-800 disabled:opacity-50 text-slate-300 border border-slate-700"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded bg-slate-800 disabled:opacity-50 text-slate-300 border border-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h2 className="text-lg font-bold text-slate-100 mb-4">{editingCustomer ? 'Edit Customer' : 'Create New Customer'}</h2>
            {formError && <div className="mb-4 p-3 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-xs">{formError}</div>}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Customer Name *</label>
                  <input type="text" required value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Business Name *</label>
                  <input type="text" required value={formData.business_name} onChange={(e) => setFormData({ ...formData, business_name: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Mobile Number *</label>
                  <input type="text" required value={formData.mobile_number} onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">GST Number</label>
                  <input type="text" value={formData.gst_number} onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Type *</label>
                  <select value={formData.customer_type} onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100">
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status *</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100">
                    <option value="Lead">Lead</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Address *</label>
                <textarea required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100" rows="2"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Follow-up Date</label>
                  <input type="date" value={formData.follow_up_date} onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Initial Notes</label>
                  <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-sm">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
