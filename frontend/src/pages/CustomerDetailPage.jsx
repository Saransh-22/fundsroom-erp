import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CustomerDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState('');

  const canAddNote = ['Admin', 'Sales'].includes(user?.role);

  const fetchCustomerData = async () => {
    setLoading(true);
    setError('');
    try {
      const custRes = await api.get(`/customers/${id}`);
      setCustomer(custRes.data.data);

      const notesRes = await api.get(`/customers/${id}/notes`);
      setNotes(notesRes.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmittingNote(true);
    setNoteError('');

    try {
      await api.post(`/customers/${id}/notes`, { note: newNote });
      setNewNote('');
      const notesRes = await api.get(`/customers/${id}/notes`);
      setNotes(notesRes.data.data);
    } catch (err) {
      setNoteError(err.response?.data?.error || 'Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) return <div className="text-slate-400">Loading customer profile...</div>;
  if (error) return <div className="p-4 rounded bg-red-500/10 text-red-400 border border-red-500/20">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/customers" className="text-xs text-indigo-400 hover:underline mb-1 inline-block">← Back to Customers</Link>
          <h1 className="text-2xl font-bold text-slate-100">{customer?.customer_name}</h1>
          <p className="text-sm text-slate-400">{customer?.business_name}</p>
        </div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {customer?.customer_type}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Profile Information</h2>
          <div className="space-y-2 text-sm">
            <div><span className="text-slate-400">Mobile:</span> <span className="text-slate-200 font-medium">{customer?.mobile_number}</span></div>
            <div><span className="text-slate-400">Email:</span> <span className="text-slate-200 font-medium">{customer?.email}</span></div>
            <div><span className="text-slate-400">GSTIN:</span> <span className="text-slate-200 font-medium">{customer?.gst_number || 'N/A'}</span></div>
            <div><span className="text-slate-400">Status:</span> <span className="text-slate-200 font-medium">{customer?.status}</span></div>
            <div><span className="text-slate-400">Follow-up:</span> <span className="text-slate-200 font-medium">{customer?.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString() : 'None scheduled'}</span></div>
            <div><span className="text-slate-400">Address:</span> <p className="text-slate-200 font-medium mt-1">{customer?.address}</p></div>
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Follow-up Notes History</h2>

            {canAddNote && (
              <form onSubmit={handleAddNote} className="mb-6 space-y-2">
                {noteError && <div className="text-xs text-red-400">{noteError}</div>}
                <textarea
                  rows="2"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record call summary or follow-up note..."
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingNote}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg disabled:opacity-50"
                  >
                    {submittingNote ? 'Saving...' : 'Add Note'}
                  </button>
                </div>
              </form>
            )}

            {notes.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No notes logged for this customer yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {notes.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-800 text-sm">
                    <p className="text-slate-200">{n.note}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>By: <strong className="text-slate-300">{n.created_by_name}</strong></span>
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
