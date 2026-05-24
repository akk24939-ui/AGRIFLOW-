import { useState, useEffect } from 'react';
import { useAdminStore, type User } from '../store/adminStore';
import { usersApi } from '../api';
import { Plus, Search, Eye, Edit, Trash2, KeyRound, ShieldOff, RefreshCw } from 'lucide-react';
import CreateUserModal from '../components/CreateUserModal';
import EditUserModal from '../components/EditUserModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import DeleteUserModal from '../components/DeleteUserModal';
import UserDetailModal from '../components/UserDetailModal';
import { showToast } from '../components/ToastContainer';

export default function UsersPage() {
  const { users, fetchUsers, loading } = useAdminStore();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [pwdUser, setPwdUser] = useState<User | null>(null);
  const [delUser, setDelUser] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);

  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  useEffect(() => { fetchUsers(); }, []);

  const ROLES = ['SUPER_ADMIN', 'ADMIN', 'OWNER', 'AGENT', 'CUSTOMER'];

  const filtered = users.filter(u => {
    if (u.is_deleted) return false;
    const q = search.toLowerCase();
    const matchQ = !q || u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || (u.land_id || '').toLowerCase().includes(q);
    const matchR = filterRole === 'ALL' || u.role === filterRole;
    const matchS = filterStatus === 'ALL' ||
                   (filterStatus === 'ACTIVE' && u.is_active) ||
                   (filterStatus === 'DISABLED' && !u.is_active);
    return matchQ && matchR && matchS;
  });

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pages = Math.ceil(filtered.length / PER_PAGE) || 1;

  const roleColor = (r: string) => {
    const map: Record<string, string> = { SUPER_ADMIN: '#f59e0b', ADMIN: '#22c55e', OWNER: '#38bdf8', AGENT: '#a78bfa', CUSTOMER: '#fb923c' };
    return map[r] || '#94a3b8';
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await usersApi.toggleStatus(user.id);
      await fetchUsers();
      showToast(`User ${user.is_active ? 'disabled' : 'enabled'} successfully`, 'success');
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const inp = { padding: '0.6rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '0.85rem', outline: 'none' };

  return (
    <div style={{ padding: '1.5rem', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>User Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>{users.filter(u=>!u.is_deleted).length} total users</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => fetchUsers()} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#1e293b', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 500 }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowCreate(true)} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(34,197,94,0.15)', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 500 }}>
            <Plus size={14} /> Create User
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0 0.75rem', flex: 1, minWidth: 200 }}>
          <Search size={15} color="#64748b" />
          <input placeholder="Search name, email, username, land ID…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ background: 'none', border: 'none', color: '#f1f5f9', padding: '0.6rem 0.5rem', outline: 'none', width: '100%', fontSize: '0.85rem' }} />
        </div>
        <select value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }} style={inp}>
          <option value="ALL">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} style={inp}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </select>
      </div>

      <div style={{ background: 'rgba(15,25,35,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr>
              {['User', 'Role', 'Land ID', 'Phone', 'Status', 'Last Login', 'Actions'].map(h => (
                <th key={h} style={{ color: '#64748b', textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading users…</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No users found</td></tr>
            ) : paged.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#fff', fontSize: '0.8rem' }}>
                      {u.full_name[0]}
                    </div>
                    <div>
                      <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.85rem' }}>{u.full_name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ color: roleColor(u.role), background: `${roleColor(u.role)}15`, padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>{u.role}</span>
                </td>
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
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setViewUser(u)} style={iconBtn('#38bdf8')} title="View"><Eye size={14} /></button>
                    <button onClick={() => setEditUser(u)} style={iconBtn('#a78bfa')} title="Edit"><Edit size={14} /></button>
                    <button onClick={() => setPwdUser(u)} style={iconBtn('#fbbf24')} title="Change Password"><KeyRound size={14} /></button>
                    <button onClick={() => handleToggleStatus(u)} style={iconBtn(u.is_active ? '#f87171' : '#4ade80')} title={u.is_active ? "Disable" : "Enable"}><ShieldOff size={14} /></button>
                    <button onClick={() => setDelUser(u)} style={iconBtn('#f87171')} title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={pageBtn}>‹ Prev</button>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ ...pageBtn, background: p === page ? 'rgba(34,197,94,0.15)' : 'transparent', color: p === page ? '#22c55e' : '#94a3b8' }}>{p}</button>
              ))}
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)} style={pageBtn}>Next ›</button>
            </div>
          </div>
        )}
      </div>

      {showCreate && <CreateUserModal onClose={() => { setShowCreate(false); fetchUsers(); }} />}
      {editUser && <EditUserModal user={editUser} onClose={() => { setEditUser(null); fetchUsers(); }} />}
      {pwdUser && <ChangePasswordModal user={pwdUser} onClose={() => setPwdUser(null)} />}
      {delUser && <DeleteUserModal user={delUser} onClose={() => { setDelUser(null); fetchUsers(); }} />}
      {viewUser && <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} />}
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const iconBtn = (color: string) => ({ padding: '6px', borderRadius: 6, background: `${color}15`, border: 'none', cursor: 'pointer', color, display: 'flex', alignItems: 'center', justifyContent: 'center' });
const pageBtn = { padding: '4px 10px', borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 };
