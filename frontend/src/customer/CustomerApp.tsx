import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../admin/store/adminStore';
import { landsApi, tasksApi, complaintsApi } from '../admin/api';
import { LogOut, Home, AlertCircle, CheckCircle, Activity, MapPin, ChevronRight, X, Image as ImageIcon, Send, Plus } from 'lucide-react';
import { showToast } from '../admin/components/ToastContainer';
import ComplaintsPanel from '../admin/components/ComplaintsPanel';
import './customer.css';

export default function CustomerApp() {
  const navigate = useNavigate();
  const { adminUser, logout } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'complaints' | 'media'>('dashboard');
  
  const [lands, setLands] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Complaint form state
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [newComplaint, setNewComplaint] = useState({ title: '', description: '', land_id: '' });

  useEffect(() => {
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }
    if (adminUser.role !== 'CUSTOMER') {
      // Wrong role — redirect to login
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [adminUser]);


  const loadData = async () => {
    setLoading(true);
    try {
      // Customer has restricted views based on their ID handled by backend
      const [lRes, tRes, cRes] = await Promise.all([
        landsApi.list(),
        tasksApi.list(),
        complaintsApi.list()
      ]);
      setLands(lRes);
      setTasks(tRes);
      setComplaints(cRes);
    } catch (err: any) {
      showToast(err.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const submitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await complaintsApi.create(newComplaint);
      showToast('Complaint submitted successfully', 'success');
      setShowComplaintForm(false);
      setNewComplaint({ title: '', description: '', land_id: '' });
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  if (!adminUser) return null;

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const activeTasksCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const pendingComplaints = complaints.filter(c => c.status === 'OPEN' || c.status === 'IN_REVIEW').length;

  const [allMedia, setAllMedia] = useState<{task: any, media: any[]}[]>([]);

  useEffect(() => {
    // When tasks load, fetch their media for the gallery
    if (tasks.length > 0) {
      Promise.all(tasks.map(t => tasksApi.getMedia(t.id).then(m => ({ task: t, media: m }))))
        .then(results => setAllMedia(results.filter(r => r.media.length > 0)))
        .catch(() => {});
    }
  }, [tasks]);

  return (
    <div className="customer-app">
      {/* Premium Sidebar */}
      <aside className="customer-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">AF</div>
          <h2>AgriFlow</h2>
        </div>
        
        <div className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <Home size={20} /> Dashboard
          </button>
          <button className={`nav-item ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>
            <ImageIcon size={20} /> Proof & Media
          </button>
          <button className={`nav-item ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}>
            <AlertCircle size={20} /> Complaints
            {pendingComplaints > 0 && <span className="nav-badge">{pendingComplaints}</span>}
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="user-info">
            <div className="avatar">{adminUser.name.charAt(0)}</div>
            <div>
              <strong>{adminUser.name}</strong>
              <span>Land Owner</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}><LogOut size={18} /> Logout</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="customer-main">
        <header className="customer-header">
          <div className="header-greeting">
            <h1>Welcome back, {adminUser.name.split(' ')[0]} 👋</h1>
            <p className="tamil-quote">"சுழன்றும் ஏர்ப்பின்னது உலகம் அதனால் உழந்தும் உழவே தலை" — Thirukkural</p>
          </div>
        </header>

        {loading ? (
          <div className="loading-state">Loading your farm data...</div>
        ) : (
          <div className="customer-content">
            {activeTab === 'dashboard' && (
              <div className="dashboard-view fade-in">
                {/* Stats Row */}
                <div className="stats-row">
                  <div className="stat-card glass">
                    <MapPin className="stat-icon text-blue" />
                    <div className="stat-info">
                      <h3>{lands.length}</h3>
                      <p>My Lands</p>
                    </div>
                  </div>
                  <div className="stat-card glass">
                    <Activity className="stat-icon text-yellow" />
                    <div className="stat-info">
                      <h3>{activeTasksCount}</h3>
                      <p>Active Tasks</p>
                    </div>
                  </div>
                  <div className="stat-card glass">
                    <CheckCircle className="stat-icon text-green" />
                    <div className="stat-info">
                      <h3>{completedTasks}</h3>
                      <p>Completed Work</p>
                    </div>
                  </div>
                </div>

                <div className="dashboard-grid">
                  {/* Lands Overview */}
                  <section className="dashboard-section glass">
                    <div className="section-header">
                      <h2>My Lands Overview</h2>
                    </div>
                    <div className="lands-list">
                      {lands.length === 0 ? <p className="empty">No lands assigned to you.</p> : lands.map(land => (
                        <div key={land.id} className="land-card">
                          <div className="land-info">
                            <h4>{land.land_name || land.land_id}</h4>
                            <p>{land.village || 'Location pending'} • {land.district}</p>
                          </div>
                          <ChevronRight size={20} color="#94a3b8" />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Task Timeline */}
                  <section className="dashboard-section glass">
                    <div className="section-header">
                      <h2>Live Work Updates</h2>
                    </div>
                    <div className="timeline-list">
                      {tasks.length === 0 ? <p className="empty">No tasks active.</p> : tasks.map(task => (
                        <div key={task.id} className="timeline-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 8, marginBottom: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className={`timeline-dot ${task.status.toLowerCase()}`}></div>
                          <div className="timeline-content" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <h4>{task.title}</h4>
                              <span className="task-status-text" style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, background: task.status === 'COMPLETED' ? 'rgba(34,197,94,0.1)' : 'rgba(56,189,248,0.1)', color: task.status === 'COMPLETED' ? '#22c55e' : '#38bdf8' }}>{task.status.replace('_', ' ')}</span>
                            </div>
                            {task.description && <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '6px 0' }}>{task.description}</p>}
                            <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: '0.75rem', color: '#cbd5e1' }}>
                              {task.category && <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>{task.category}</span>}
                              <span className="task-date">Assigned on: {new Date(task.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'complaints' && (
              <div className="complaints-view fade-in" style={{ padding: 0 }}>
                {/* New Complaint Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.5rem 0' }}>
                  <button
                    onClick={() => setShowComplaintForm(true)}
                    style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus size={16} /> Raise New Issue
                  </button>
                </div>
                <ComplaintsPanel mode="customer" currentUser={adminUser} />
              </div>
            )}

            {activeTab === 'media' && (
              <div className="media-view fade-in">
                <div className="section-header">
                  <h2>Work Proof Gallery</h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>Images, videos and documents uploaded by your agent</p>
                </div>

                {allMedia.length === 0 ? (
                  <div className="empty-glass" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <ImageIcon size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                    <h3>No Media Available</h3>
                    <p>When your agent uploads work proofs, they will appear here.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                    {allMedia.flatMap(item =>
                      item.media.map((m: any) => {
                        const fileUrl = `http://localhost:8005${m.file_url}`;
                        const isImage = m.file_type && m.file_type.startsWith('image/');
                        const isVideo = m.file_type && m.file_type.startsWith('video/');
                        const taskLand = lands.find((l: any) => l.id === item.task.land_id || l.land_id === item.task.land_id);
                        return (
                          <div key={m.id} style={{ background: 'rgba(15,25,35,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {/* Media preview */}
                            <div style={{ height: 180, background: '#0b1118', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                              {isImage ? (
                                <img
                                  src={fileUrl}
                                  alt="Task Proof"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : isVideo ? (
                                <video controls style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}>
                                  <source src={fileUrl} type={m.file_type} />
                                </video>
                              ) : (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                                >
                                  <ImageIcon size={40} color="#f97316" />
                                  <span style={{ fontSize: '0.8rem' }}>📄 View Document</span>
                                </a>
                              )}
                            </div>

                            {/* Card info + Download */}
                            <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                              {/* Task name */}
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 6px', borderRadius: 6, whiteSpace: 'nowrap', flexShrink: 0 }}>TASK</span>
                                <h4 style={{ color: '#f1f5f9', margin: 0, fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.3 }}>{item.task.title}</h4>
                              </div>

                              {/* Project / Land */}
                              {taskLand && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '2px 6px', borderRadius: 6, whiteSpace: 'nowrap' }}>PROJECT</span>
                                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{taskLand.land_name || taskLand.land_id}</span>
                                </div>
                              )}

                              {/* Date + Status + Download */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  <span style={{ color: '#64748b', fontSize: '0.72rem' }}>
                                    {new Date(m.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                  <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: 20, background: item.task.status === 'COMPLETED' ? 'rgba(34,197,94,0.15)' : 'rgba(56,189,248,0.1)', color: item.task.status === 'COMPLETED' ? '#22c55e' : '#38bdf8', fontWeight: 600, alignSelf: 'flex-start' }}>
                                    {item.task.status.replace('_', ' ')}
                                  </span>
                                </div>

                                {/* Download button */}
                                <a
                                  href={fileUrl}
                                  download
                                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.4rem 0.75rem', borderRadius: 8, background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0 }}
                                >
                                  ⬇ Download
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Complaint Modal */}
      {showComplaintForm && (
        <div className="modal-overlay glass-overlay">
          <div className="modal-content glass-modal fade-in">
            <div className="modal-header">
              <h2>Raise an Issue</h2>
              <button onClick={() => setShowComplaintForm(false)} className="btn-close"><X /></button>
            </div>
            <form onSubmit={submitComplaint} className="modal-form">
              <div className="form-group">
                <label>Related Land (Optional)</label>
                <select value={newComplaint.land_id} onChange={e => setNewComplaint({...newComplaint, land_id: e.target.value})}>
                  <option value="">Select a Land</option>
                  {lands.map(l => <option key={l.id} value={l.id}>{l.land_name || l.land_id}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Issue Title</label>
                <input required type="text" placeholder="E.g., Fertilizer not applied properly" value={newComplaint.title} onChange={e => setNewComplaint({...newComplaint, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Detailed Description</label>
                <textarea required rows={4} placeholder="Please provide details..." value={newComplaint.description} onChange={e => setNewComplaint({...newComplaint, description: e.target.value})}></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit"><Send size={18} /> Submit Complaint</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
