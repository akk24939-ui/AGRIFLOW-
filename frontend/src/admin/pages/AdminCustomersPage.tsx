import { useState, useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { Search, Eye, RefreshCw } from 'lucide-react';
import UserDetailModal from '../components/UserDetailModal';

export default function AdminCustomersPage() {
  const { users, fetchUsers, loading } = useAdminStore();
  const [search, setSearch] = useState('');
  const [viewUser, setViewUser] = useState<any | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const customers = users.filter(u => u.role === 'CUSTOMER' && !u.is_deleted);
  
  const filtered = customers.filter(u => {
    const q = search.toLowerCase();
    return !q || u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.land_id || '').toLowerCase().includes(q);
  });

  return (
    <div style={{ padding: '1.5rem', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>All Customers</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>{customers.length} total customers registered</p>
        </div>
        <button onClick={() => fetchUsers()} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#1e293b', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 500 }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0 0.75rem', flex: 1 }}>
          <Search size={15} color="#64748b" />
          <input placeholder="Search customer name, email, or land ID…" value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', color: '#f1f5f9', padding: '0.6rem 0.5rem', outline: 'none', width: '100%', fontSize: '0.85rem' }} />
        </div>
      </div>

      <div style={{ background: 'rgba(15,25,35,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr>
              {['Customer Name', 'Email', 'Land ID', 'Phone', 'Status', 'Last Login', 'Actions'].map(h => (
                <th key={h} style={{ color: '#64748b', textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && customers.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading customers…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No customers found</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '0.75rem 1rem', color: '#f1f5f9', fontWeight: 600 }}>{u.full_name}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{u.email}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#38bdf8', fontFamily: 'monospace' }}>{u.land_id || '—'}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{u.phone || '—'}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ color: u.is_active ? '#4ade80' : '#f87171', background: u.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>
                    {u.is_active ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>
                  {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <button onClick={() => setViewUser(u)} style={{ padding: '6px', borderRadius: 6, background: '#38bdf815', border: 'none', cursor: 'pointer', color: '#38bdf8' }} title="View Details">
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewUser && <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} />}
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
