import { useState, useEffect } from 'react';
import { useAdminStore, type Land } from '../store/adminStore';
import { landsApi } from '../api';
import { MapPin, Plus, X, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { showToast } from '../components/ToastContainer';

export default function LandsPage() {
  const { lands, fetchLands, loading, users, fetchUsers, adminUser } = useAdminStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editLand, setEditLand] = useState<Land | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ land_id: '', land_name: '', district: '', village: '', owner_id: '', customer_id: '' });

  useEffect(() => { 
    fetchLands();
    if (adminUser?.role === 'SUPER_ADMIN' || adminUser?.role === 'ADMIN' || adminUser?.role === 'OWNER') {
      fetchUsers(); 
    }
  }, []);

  const filtered = lands.filter(l => {
    const q = search.toLowerCase();
    return !q || l.land_id.toLowerCase().includes(q) || (l.land_name || '').toLowerCase().includes(q) || (l.district || '').toLowerCase().includes(q) || (l.village || '').toLowerCase().includes(q);
  });

  const handleCreate = async () => {
    if (!form.land_id || !form.land_name || !form.district || !form.village) { showToast('Fill all required fields', 'error'); return; }
    try {
      await landsApi.create(form);
      await fetchLands();
      showToast(`Land ${form.land_id} created successfully`, 'success');
      setForm({ land_id: '', land_name: '', district: '', village: '', owner_id: '', customer_id: '' });
      setShowCreate(false);
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const handleUpdate = async () => {
    if (!editLand) return;
    try {
      await landsApi.update(editLand.id, { 
        land_name: editLand.land_name, 
        district: editLand.district, 
        village: editLand.village,
        owner_id: editLand.owner_id,
        customer_id: editLand.customer_id
      });
      await fetchLands();
      showToast('Land updated successfully', 'success');
      setEditLand(null);
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this land? This action cannot be undone.')) return;
    try {
      await landsApi.delete(id);
      await fetchLands();
      showToast('Land deleted', 'success');
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const inp = { padding: '0.6rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box' as const };
  const lbl = { display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 };
  const iconBtn = (c: string) => ({ padding: '0.4rem', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.05)', color: c, cursor: 'pointer', display: 'flex', alignItems: 'center' });

  const owners = users.filter(u => u.role === 'OWNER');

  return (
    <div style={{ padding: '1.5rem', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Land Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>{lands.length} registered lands</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => fetchLands()} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#1e293b', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 500 }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowCreate(true)} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(34,197,94,0.15)', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 500 }}>
            <Plus size={14} /> Add Land Record
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0 0.75rem', maxWidth: 400, marginBottom: '1.5rem' }}>
        <MapPin size={15} color="#64748b" />
        <input placeholder="Search land ID, name, district, village…" value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', color: '#f1f5f9', padding: '0.6rem 0.5rem', outline: 'none', width: '100%', fontSize: '0.85rem' }} />
      </div>

      <div style={{ background: 'rgba(15,25,35,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr>
              {['Land ID', 'Name', 'District', 'Village', 'Assigned Owner', 'Assigned Customer', 'Created', 'Actions'].map(h => (
                <th key={h} style={{ color: '#64748b', textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && lands.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading lands…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No lands found</td></tr>
            ) : filtered.map(l => {
              const assignedOwner = users.find(u => u.id === l.owner_id);
              const assignedCustomer = users.find(u => u.id === l.customer_id);
              return (
              <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>{l.land_id}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#f1f5f9', fontWeight: 500 }}>{l.land_name || '—'}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{l.district || '—'}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{l.village || '—'}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {assignedOwner ? <span style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>{assignedOwner.full_name}</span> : <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Unassigned</span>}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {assignedCustomer ? <span style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>{assignedCustomer.full_name}</span> : <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Unassigned</span>}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.75rem' }}>{l.created_at ? new Date(l.created_at).toLocaleDateString() : '—'}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setEditLand(l)} style={iconBtn('#38bdf8')} title="Edit"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(l.id)} style={iconBtn('#f87171')} title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, width: 450, padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#f1f5f9' }}>Add Land Record</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div><label style={lbl}>Land ID (e.g. TN-CH-001) *</label><input style={inp} placeholder="TN-CH-001" value={form.land_id} onChange={e => setForm(f => ({ ...f, land_id: e.target.value }))} /></div>
              <div><label style={lbl}>Land Name *</label><input style={inp} placeholder="Panimugil Estate" value={form.land_name} onChange={e => setForm(f => ({ ...f, land_name: e.target.value }))} /></div>
              <div><label style={lbl}>District *</label><input style={inp} placeholder="Chennai" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} /></div>
              <div><label style={lbl}>Village *</label><input style={inp} placeholder="Ambattur" value={form.village} onChange={e => setForm(f => ({ ...f, village: e.target.value }))} /></div>
              
              {(adminUser?.role === 'SUPER_ADMIN' || adminUser?.role === 'ADMIN') && (
                <div>
                  <label style={lbl}>Assign Owner</label>
                  <select style={inp} value={form.owner_id} onChange={e => setForm(f => ({ ...f, owner_id: e.target.value }))}>
                    <option value="">-- Unassigned --</option>
                    {owners.map(o => <option key={o.id} value={o.id}>{o.full_name}</option>)}
                  </select>
                </div>
              )}
              

            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: '0.6rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#1e293b', color: '#f1f5f9', fontWeight: 500, fontSize: '0.85rem' }}>Cancel</button>
              <button onClick={handleCreate} style={{ padding: '0.6rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>Create Land</button>
            </div>
          </div>
        </div>
      )}

      {editLand && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, width: 450, padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#f1f5f9' }}>Edit Land Record</h2>
              <button onClick={() => setEditLand(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div><label style={lbl}>Land ID (Read Only)</label><input style={{ ...inp, opacity: 0.6 }} value={editLand.land_id} readOnly /></div>
              <div><label style={lbl}>Land Name</label><input style={inp} value={editLand.land_name || ''} onChange={e => setEditLand(l => l ? { ...l, land_name: e.target.value } : null)} /></div>
              <div><label style={lbl}>District</label><input style={inp} value={editLand.district || ''} onChange={e => setEditLand(l => l ? { ...l, district: e.target.value } : null)} /></div>
              <div><label style={lbl}>Village</label><input style={inp} value={editLand.village || ''} onChange={e => setEditLand(l => l ? { ...l, village: e.target.value } : null)} /></div>

              {(adminUser?.role === 'SUPER_ADMIN' || adminUser?.role === 'ADMIN') && (
                <div>
                  <label style={lbl}>Assign Owner</label>
                  <select style={inp} value={editLand.owner_id || ''} onChange={e => setEditLand(l => l ? { ...l, owner_id: e.target.value } : null)}>
                    <option value="">-- Unassigned --</option>
                    {owners.map(o => <option key={o.id} value={o.id}>{o.full_name}</option>)}
                  </select>
                </div>
              )}
              

            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setEditLand(null)} style={{ padding: '0.6rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#1e293b', color: '#f1f5f9', fontWeight: 500, fontSize: '0.85rem' }}>Cancel</button>
              <button onClick={handleUpdate} style={{ padding: '0.6rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#38bdf8,#0284c7)', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>Update Land</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
