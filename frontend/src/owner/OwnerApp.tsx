import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Users, ClipboardList, LogOut,
  Menu, X, Leaf, RefreshCw, Plus, Edit, MessageCircle,
  Image as ImageIcon, Video, FileText, Download, Upload
} from 'lucide-react';
import { useAdminStore } from '../admin/store/adminStore';
import CreateUserModal from '../admin/components/CreateUserModal';
import EditUserModal from '../admin/components/EditUserModal';
import CreateTaskModal from '../admin/components/CreateTaskModal';
import ComplaintsPanel from '../admin/components/ComplaintsPanel';
import { tasksApi } from '../admin/api';
import { showToast } from '../admin/components/ToastContainer';

const MEDIA_BASE = 'http://localhost:8005';

// ── Lightbox ──────────────────────────────────────────────────────────────────
function OwnerLightbox({ url, fileType, onClose }: { url: string; fileType: string; onClose: () => void }) {
  const isImage = fileType?.startsWith('image');
  const isVideo = fileType?.startsWith('video');
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.92)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:40, height:40, cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={20}/></button>
      <a href={url} download onClick={e=>e.stopPropagation()} style={{ position:'absolute', top:16, right:64, background:'rgba(255,255,255,0.1)', borderRadius:8, padding:'8px 12px', color:'#fff', textDecoration:'none', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:6 }}><Download size={14}/> Download</a>
      <div onClick={e=>e.stopPropagation()} style={{ maxWidth:'90vw', maxHeight:'88vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {isImage ? (
          <img src={url} alt="Media" style={{ maxWidth:'90vw', maxHeight:'85vh', borderRadius:8, objectFit:'contain', boxShadow:'0 20px 60px rgba(0,0,0,0.6)' }} />
        ) : isVideo ? (
          <video controls autoPlay style={{ maxWidth:'90vw', maxHeight:'85vh', borderRadius:8 }}>
            <source src={url} type={fileType} />
          </video>
        ) : (
          <div style={{ textAlign:'center', color:'#f1f5f9' }}>
            <FileText size={60} color="#38bdf8" style={{ marginBottom:16 }}/>
            <a href={url} target="_blank" rel="noreferrer" style={{ padding:'0.6rem 1.2rem', borderRadius:8, background:'#38bdf8', color:'#0f172a', textDecoration:'none', fontWeight:700 }}>Open Document</a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Owner Task Media Gallery ───────────────────────────────────────────────────
function OwnerTaskMedia({ taskId }: { taskId: string }) {
  const [media, setMedia]     = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lb, setLb]           = useState<{url:string; fileType:string}|null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    tasksApi.getMedia(taskId)
      .then(setMedia)
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, [taskId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      await tasksApi.uploadMedia(taskId, e.target.files[0]);
      showToast('Uploaded!', 'success');
      const fresh = await tasksApi.getMedia(taskId);
      setMedia(fresh);
    } catch { showToast('Upload failed', 'error'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  return (
    <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
        <h4 style={{ color:'#f1f5f9', fontSize:'0.82rem', margin:0, display:'flex', alignItems:'center', gap:6 }}>
          <ImageIcon size={13}/> Attachments / Work Proof ({media.length})
        </h4>
        <label style={{ padding:'0.3rem 0.7rem', borderRadius:6, background:'rgba(56,189,248,0.12)', color:'#38bdf8', fontSize:'0.75rem', cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
          {uploading ? 'Uploading…' : <><Upload size={12}/> Upload</>}
          <input type="file" style={{ display:'none' }} ref={fileRef} accept="image/*,video/*,application/pdf" onChange={handleUpload} disabled={uploading}/>
        </label>
      </div>
      {loading ? (
        <div style={{ color:'#64748b', fontSize:'0.78rem' }}>Loading…</div>
      ) : media.length === 0 ? (
        <div style={{ padding:'1rem', textAlign:'center', background:'rgba(0,0,0,0.2)', borderRadius:8, color:'#475569', fontSize:'0.78rem' }}>No attachments yet.</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:'0.6rem' }}>
          {media.map((m:any)=>{
            const isImg = m.file_type?.startsWith('image');
            const isVid = m.file_type?.startsWith('video');
            const url = `${MEDIA_BASE}${m.file_url}`;
            return (
              <div key={m.id} onClick={()=>setLb({url, fileType:m.file_type})} style={{ background:'#1e293b', borderRadius:8, overflow:'hidden', cursor:'pointer', border:'1px solid rgba(255,255,255,0.06)', transition:'transform 0.15s' }}
                onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.04)')}
                onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
              >
                <div style={{ height:80, background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                  {isImg ? (
                    <img src={url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="Proof" onError={e=>{(e.target as any).style.display='none';}}/>
                  ) : isVid ? (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}><Video size={26} color="#38bdf8"/><span style={{ fontSize:'0.6rem', color:'#64748b' }}>Video</span></div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}><FileText size={26} color="#f97316"/><span style={{ fontSize:'0.6rem', color:'#64748b' }}>Doc</span></div>
                  )}
                </div>
                <div style={{ padding:'4px 6px', fontSize:'0.62rem', color:'#94a3b8' }}>
                  {new Date(m.uploaded_at).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {lb && <OwnerLightbox url={lb.url} fileType={lb.fileType} onClose={()=>setLb(null)}/>}
    </div>
  );
}

// ─── Guard ─────────────────────────────────────────────────────────────────
function OwnerGuard({ children }: { children: React.ReactNode }) {
  const adminUser = useAdminStore(s => s.adminUser);
  if (!adminUser) return <Navigate to="/admin/login" replace />;
  if (adminUser.role !== 'OWNER') return <Navigate to="/admin/login" replace />;
  return children;
}


// ─── Sidebar ────────────────────────────────────────────────────────────────
const NAV = [
  { label: 'Dashboard',  icon: LayoutDashboard, path: '/owner/dashboard'   },
  { label: 'My Lands',   icon: MapPin,           path: '/owner/lands'       },
  { label: 'Customers',  icon: Users,            path: '/owner/customers'   },
  { label: 'Tasks',      icon: ClipboardList,    path: '/owner/tasks'       },
  { label: 'Complaints', icon: MessageCircle,    path: '/owner/complaints'  },
];

function OwnerSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const { adminUser, logout } = useAdminStore();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40, display: 'none' }} />}
      <aside style={{
        width: 220, minHeight: '100vh', background: 'rgba(10,18,25,0.97)',
        borderRight: '1px solid rgba(34,197,94,0.12)', display: 'flex',
        flexDirection: 'column', padding: '1.25rem 0', position: 'sticky', top: 0,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={18} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9rem' }}>AgriFlow</div>
              <div style={{ color: '#22c55e', fontSize: '0.7rem', fontWeight: 600 }}>OWNER PORTAL</div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding: '1rem 1.25rem', marginBottom: '0.5rem' }}>
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10, padding: '0.6rem 0.8rem' }}>
            <div style={{ color: '#22c55e', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 2 }}>LOGGED IN AS</div>
            <div style={{ color: '#f1f5f9', fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminUser?.name}</div>
            <div style={{ color: '#64748b', fontSize: '0.72rem' }}>{adminUser?.username}</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 0.75rem' }}>
          {NAV.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '0.6rem 0.75rem',
                  borderRadius: 8, marginBottom: 4, cursor: 'pointer', transition: 'all 0.15s',
                  background: active ? 'rgba(34,197,94,0.12)' : 'transparent',
                  color: active ? '#22c55e' : '#94a3b8',
                }}>
                  <Icon size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: active ? 600 : 400 }}>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0 0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Owner Dashboard ────────────────────────────────────────────────────────
function OwnerDashboard() {
  const { adminUser, lands, fetchLands, users, fetchUsers, tasks, fetchTasks } = useAdminStore();
  const [stats, setStats] = useState({ myLands: 0, myCustomers: 0, pendingTasks: 0, completedTasks: 0 });

  useEffect(() => {
    fetchLands();
    fetchUsers();
    fetchTasks();
  }, []);

  useEffect(() => {
    const myLandIds = lands.filter(l => l.owner_id === adminUser?.id).map(l => l.land_id);
    const myCustomers = users.filter(u => u.role === 'CUSTOMER' && u.land_id && myLandIds.includes(u.land_id));
    const myTasks = tasks.filter(t => myLandIds.includes(t.land_id || ''));
    setStats({
      myLands: myLandIds.length,
      myCustomers: myCustomers.length,
      pendingTasks: myTasks.filter(t => t.status !== 'COMPLETED').length,
      completedTasks: myTasks.filter(t => t.status === 'COMPLETED').length,
    });
  }, [lands, users, tasks, adminUser]);

  const cardStyle = (color: string) => ({
    background: `rgba(${color},0.06)`, border: `1px solid rgba(${color},0.15)`,
    borderRadius: 14, padding: '1.25rem 1.5rem', flex: 1, minWidth: 160,
  });

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter,sans-serif' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
          Welcome back, {adminUser?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>Owner Control Center — Your land portfolio at a glance</p>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={cardStyle('34,197,94')}>
          <div style={{ color: '#22c55e', fontSize: '2rem', fontWeight: 800 }}>{stats.myLands}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: 4 }}>My Lands</div>
        </div>
        <div style={cardStyle('56,189,248')}>
          <div style={{ color: '#38bdf8', fontSize: '2rem', fontWeight: 800 }}>{stats.myCustomers}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: 4 }}>Customers</div>
        </div>
        <div style={cardStyle('251,191,36')}>
          <div style={{ color: '#fbbf24', fontSize: '2rem', fontWeight: 800 }}>{stats.pendingTasks}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: 4 }}>Pending Tasks</div>
        </div>
        <div style={cardStyle('167,243,208')}>
          <div style={{ color: '#a7f3d0', fontSize: '2rem', fontWeight: 800 }}>{stats.completedTasks}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: 4 }}>Completed</div>
        </div>
      </div>

      <div style={{ background: 'rgba(15,25,35,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '1.25rem' }}>
        <h3 style={{ color: '#f1f5f9', margin: '0 0 1rem', fontSize: '0.95rem' }}>📍 My Lands Overview</h3>
        {lands.filter(l => l.owner_id === adminUser?.id).length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>No lands assigned yet. Contact your admin.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lands.filter(l => l.owner_id === adminUser?.id).map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600, fontSize: '0.82rem' }}>{l.land_id}</span>
                  <span style={{ color: '#f1f5f9', marginLeft: 10, fontSize: '0.85rem' }}>{l.land_name}</span>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{l.district}, {l.village}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Owner Lands Page ────────────────────────────────────────────────────────
function OwnerLandsPage() {
  const { adminUser, lands, fetchLands, loading } = useAdminStore();
  const myLands = lands.filter(l => l.owner_id === adminUser?.id);

  useEffect(() => { fetchLands(); }, []);

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter,sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>My Lands</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>{myLands.length} land records assigned to you</p>
        </div>
        <button onClick={() => fetchLands()} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#1e293b', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div style={{ background: 'rgba(15,25,35,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr>
              {['Land ID', 'Name', 'District', 'Village', 'Customer', 'Created'].map(h => (
                <th key={h} style={{ color: '#64748b', textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myLands.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No lands assigned to you yet</td></tr>
            ) : myLands.map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '0.75rem 1rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>{l.land_id}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#f1f5f9' }}>{l.land_name || '—'}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{l.district || '—'}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{l.village || '—'}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {l.customer_id ? <span style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>Assigned</span> : <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Unassigned</span>}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.75rem' }}>{l.created_at ? new Date(l.created_at).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Owner Customers Page ────────────────────────────────────────────────────
function OwnerCustomersPage() {
  const { adminUser, lands, users, fetchUsers, fetchLands, loading } = useAdminStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);

  useEffect(() => { fetchUsers(); fetchLands(); }, []);

  const myLandIds = lands.filter(l => l.owner_id === adminUser?.id).map(l => l.land_id);
  const myCustomers = users.filter(u => {
    if (u.role !== 'CUSTOMER' && u.role !== 'AGENT') return false;
    if (!u.land_id) return false;
    const userLands = u.land_id.split(',').map(s => s.trim());
    return userLands.some(ul => myLandIds.includes(ul));
  });

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter,sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>My People (Customers & Agents)</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>{myCustomers.length} people linked to your lands</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { fetchUsers(); fetchLands(); }} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#1e293b', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowCreate(true)} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
            <Plus size={14} /> Add Person
          </button>
        </div>
      </div>

      {showCreate && <CreateUserModal onClose={() => { setShowCreate(false); fetchUsers(); }} />}
      {editUser && <EditUserModal user={editUser} onClose={() => { setEditUser(null); fetchUsers(); }} />}

      <div style={{ background: 'rgba(15,25,35,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr>
              {['Full Name', 'Username', 'Email', 'Phone', 'Land ID', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ color: '#64748b', textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myCustomers.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No customers linked to your lands yet</td></tr>
            ) : myCustomers.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '0.75rem 1rem', color: '#f1f5f9', fontWeight: 500 }}>{u.full_name}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.8rem' }}>{u.username}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>{u.email}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{u.phone || '—'}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>{u.land_id}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ color: u.is_active ? '#22c55e' : '#f87171', background: u.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)', padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>
                    {u.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.75rem' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <button onClick={() => setEditUser(u)} style={{ padding: '6px', borderRadius: 6, background: 'rgba(167,139,250,0.15)', border: 'none', cursor: 'pointer', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit">
                    <Edit size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Owner Tasks Page ────────────────────────────────────────────────────────
function OwnerTasksPage() {
  const { users, tasks, fetchTasks, fetchLands, fetchUsers, loading } = useAdminStore();
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { fetchTasks(); fetchLands(); fetchUsers(); }, []);

  const statusColor = (s: string) => s === 'COMPLETED' ? '#22c55e' : s === 'IN_PROGRESS' ? '#38bdf8' : '#fbbf24';

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter,sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>My Tasks</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>{tasks.length} tasks — click any task to view attachments</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { fetchTasks(); fetchLands(); }} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#1e293b', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowCreate(true)} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
            <Plus size={14} /> Assign Task
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No tasks found for your lands</div>
        ) : tasks.map(t => {
          const assignedAgent = users.find(u => u.id === t.assigned_to);
          const isOpen = expanded === t.id;
          return (
          <div key={t.id} style={{ background: 'rgba(15,25,35,0.9)', border: isOpen ? '1px solid rgba(56,189,248,0.3)' : '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
            <div onClick={() => setExpanded(isOpen ? null : t.id)} style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{t.title}</div>
                  {t.priority && t.priority !== 'MEDIUM' ? <span style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 10 }}>{t.priority}</span> : null}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 6 }}>{t.description || '—'}</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.78rem' }}>Land: {t.land_id || '—'}</span>
                  <span style={{ color: '#a7f3d0', fontSize: '0.78rem' }}>Agent: {assignedAgent?.full_name || 'Unassigned'}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ color: statusColor(t.status), background: `rgba(${statusColor(t.status) === '#22c55e' ? '34,197,94' : statusColor(t.status) === '#38bdf8' ? '56,189,248' : '251,191,36'},0.1)`, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600 }}>{t.status}</span>
                {t.deadline && <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 6 }}>Due: {new Date(t.deadline).toLocaleDateString()}</div>}
                <div style={{ color: '#475569', fontSize: '0.7rem', marginTop: 4 }}>🖼 Click to view attachments</div>
              </div>
            </div>
            {isOpen && (
              <div style={{ padding: '0 1.25rem 1.25rem', background: 'rgba(0,0,0,0.1)' }}>
                <OwnerTaskMedia taskId={t.id} />
              </div>
            )}
          </div>
          );
        })}
      </div>

      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

// ─── Owner Complaints Page ─────────────────────────────────────────────────
function OwnerComplaintsPage() {
  const { adminUser } = useAdminStore();
  return <ComplaintsPanel mode="owner" currentUser={adminUser} />;
}

// ─── Owner App Shell ────────────────────────────────────────────────────────
export default function OwnerApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <OwnerGuard>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0b1118', fontFamily: 'Inter,sans-serif' }}>
        <OwnerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top bar */}
          <div style={{ height: 52, background: 'rgba(10,18,25,0.95)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 1.25rem', gap: 12, flexShrink: 0 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Owner Portal</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading…</div>}>
              <Routes>
                <Route path="dashboard"   element={<OwnerDashboard />} />
                <Route path="lands"       element={<OwnerLandsPage />} />
                <Route path="customers"   element={<OwnerCustomersPage />} />
                <Route path="tasks"       element={<OwnerTasksPage />} />
                <Route path="complaints"  element={<OwnerComplaintsPage />} />
                <Route index              element={<Navigate to="dashboard" replace />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </OwnerGuard>
  );
}
