import { useEffect, useState, useRef } from 'react';
import { useAdminStore } from '../store/adminStore';
import { tasksApi } from '../api';
import { ClipboardList, Plus, Trash2, RefreshCw, Upload, Image as ImageIcon, FileText, Video, X, ZoomIn, Download } from 'lucide-react';
import { showToast } from '../components/ToastContainer';
import CreateTaskModal from '../components/CreateTaskModal';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING:     { bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24' },
  IN_PROGRESS: { bg: 'rgba(56,189,248,0.15)',  text: '#38bdf8' },
  COMPLETED:   { bg: 'rgba(34,197,94,0.15)',   text: '#22c55e' },
};

// ── Correct backend port ──────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8005';

// ── Lightbox viewer (image / video / pdf) ────────────────────────────────────
function MediaLightbox({ url, fileType, onClose }: { url: string; fileType: string; onClose: () => void }) {
  const isImage = fileType?.startsWith('image');
  const isVideo = fileType?.startsWith('video');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <X size={20} />
      </button>
      <a
        href={url}
        download
        onClick={e => e.stopPropagation()}
        style={{ position: 'absolute', top: 16, right: 64, background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <Download size={14} /> Download
      </a>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isImage ? (
          <img src={url} alt="Media" style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8, objectFit: 'contain', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }} />
        ) : isVideo ? (
          <video controls autoPlay style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8, outline: 'none' }}>
            <source src={url} type={fileType} />
          </video>
        ) : (
          <div style={{ textAlign: 'center', color: '#f1f5f9' }}>
            <FileText size={60} color="#38bdf8" style={{ marginBottom: 16 }} />
            <p style={{ marginBottom: 16, color: '#94a3b8' }}>PDF / Document — open in browser to view</p>
            <a href={url} target="_blank" rel="noreferrer" style={{ padding: '0.6rem 1.2rem', borderRadius: 8, background: '#38bdf8', color: '#0f172a', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
              Open Document
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Task Media Gallery ────────────────────────────────────────────────────────
function TaskMediaGallery({ taskId }: { taskId: string }) {
  const [media, setMedia]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; fileType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await tasksApi.getMedia(taskId);
      setMedia(data);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMedia(); }, [taskId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      await tasksApi.uploadMedia(taskId, file);
      showToast('Media uploaded successfully', 'success');
      loadMedia();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h4 style={{ color: '#f1f5f9', fontSize: '0.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ImageIcon size={14}/> Task Proof / Attachments ({media.length})
        </h4>
        <label style={{ ...btnStyle('rgba(56,189,248,0.15)', '#38bdf8'), padding: '0.3rem 0.75rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          {uploading ? 'Uploading...' : <><Upload size={13}/> Upload Media</>}
          <input type="file" style={{ display: 'none' }} onChange={handleUpload} ref={fileInputRef} accept="image/*,video/*,application/pdf" disabled={uploading}/>
        </label>
      </div>

      {loading ? (
        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Loading media...</div>
      ) : media.length === 0 ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 8, color: '#475569', fontSize: '0.8rem' }}>
          No attachments yet. Agent can upload completion proof here.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
          {media.map((m: any) => {
            const isImage = m.file_type?.startsWith('image');
            const isVideo = m.file_type?.startsWith('video');
            const mediaUrl = `${API_BASE}${m.file_url}`;
            return (
              <div
                key={m.id}
                onClick={() => setLightbox({ url: mediaUrl, fileType: m.file_type })}
                style={{ display: 'block', background: '#1e293b', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', position: 'relative', transition: 'transform 0.15s', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div style={{ height: 90, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  {isImage ? (
                    <img
                      src={mediaUrl}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      alt="Proof"
                      onError={e => { (e.target as any).style.display = 'none'; }}
                    />
                  ) : isVideo ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <Video size={28} color="#38bdf8"/>
                      <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Video</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <FileText size={28} color="#f97316"/>
                      <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Document</span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0'; }}
                  >
                    <ZoomIn size={20} color="#fff" />
                  </div>
                </div>
                <div style={{ padding: '6px 8px', fontSize: '0.65rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {new Date(m.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && <MediaLightbox url={lightbox.url} fileType={lightbox.fileType} onClose={() => setLightbox(null)} />}
    </div>
  );
}

export default function TasksPage() {
  const { tasks, fetchTasks, users, lands, fetchUsers, fetchLands } = useAdminStore();
  const [creating, setCreating]       = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
    if (users.length === 0) fetchUsers();
    if (lands.length === 0) fetchLands();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this task?')) return;
    try {
      await tasksApi.delete(id);
      await fetchTasks();
      showToast('Task deleted', 'success');
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const handleStatusChange = async (id: string, status: string, e: React.ChangeEvent<any>) => {
    e.stopPropagation();
    try {
      await tasksApi.update(id, { status });
      await fetchTasks();
      showToast('Status updated', 'success');
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  return (
    <div style={{ padding:'1.5rem', fontFamily:"'Inter',sans-serif" }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
        <div>
          <h1 style={{ color:'#f1f5f9', fontSize:'1.4rem', fontWeight:700, margin:0 }}>Task &amp; Media Management</h1>
          <p style={{ color:'#64748b', fontSize:'0.85rem', marginTop:4 }}>Assign tasks, track progress, and view agent proof videos/photos.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => fetchTasks()} style={{ ...btnStyle('#1e293b','#94a3b8'), display:'flex', alignItems:'center', gap:6 }}>
            <RefreshCw size={14}/> Refresh
          </button>
          <button onClick={() => setCreating(!creating)} style={{ ...btnStyle('rgba(34,197,94,0.15)','#22c55e'), display:'flex', alignItems:'center', gap:6 }}>
            {creating ? <X size={14}/> : <Plus size={14}/>} {creating ? 'Cancel' : 'New Task'}
          </button>
        </div>
      </div>

      {creating && <CreateTaskModal onClose={() => setCreating(false)} />}

      <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
        {tasks.length === 0 ? (
          <div style={{ textAlign:'center', padding:'3rem', color:'#475569' }}>
            <ClipboardList size={40} color="#334155" style={{ marginBottom:12 }}/>
            <p>No tasks yet. Create a task to assign work to agents.</p>
          </div>
        ) : tasks.map(task => {
          const sc = STATUS_COLORS[task.status] || STATUS_COLORS.PENDING;
          const isExpanded = expandedTask === task.id;
          const agent = users.find(u => u.id === task.assigned_to);
          const land  = lands.find(l => l.id === task.land_id);

          return (
            <div key={task.id} style={{ background:'rgba(15,25,35,0.9)', border: isExpanded ? '1px solid rgba(56,189,248,0.3)' : '1px solid rgba(255,255,255,0.06)', borderRadius:10, overflow:'hidden', transition: 'all 0.2s' }}>
              <div onClick={() => setExpandedTask(isExpanded ? null : task.id)} style={{ padding:'1rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', cursor: 'pointer' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                    <span style={{ color:'#f1f5f9', fontWeight:600, fontSize:'0.9rem' }}>{task.title}</span>
                    <span style={{ background:sc.bg, color:sc.text, fontSize:'0.7rem', fontWeight:600, padding:'2px 8px', borderRadius:20 }}>{task.status.replace('_', ' ')}</span>
                  </div>
                  {task.description && <p style={{ color:'#64748b', fontSize:'0.8rem', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{task.description}</p>}
                  <div style={{ display:'flex', gap:12, marginTop:4, flexWrap:'wrap' }}>
                    {land  && <span style={{ color:'#38bdf8', fontFamily:'monospace', fontSize:'0.75rem' }}>🗺 {land.land_id}</span>}
                    {agent && <span style={{ color:'#a7f3d0', fontSize:'0.75rem' }}>👤 {agent.full_name}</span>}
                    {task.deadline && <span style={{ color:'#475569', fontSize:'0.75rem' }}>📅 Due: {new Date(task.deadline).toLocaleDateString('en-IN')}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:6 }} onClick={e => e.stopPropagation()}>
                  <select
                    value={task.status}
                    onChange={e => handleStatusChange(task.id, e.target.value, e)}
                    style={{ padding:'0.35rem 0.5rem', borderRadius:6, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8', fontSize:'0.78rem', cursor:'pointer', outline:'none' }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <button onClick={(e) => handleDelete(task.id, e)} style={{ padding:'0.35rem 0.5rem', borderRadius:6, background:'rgba(239,68,68,0.1)', border:'none', cursor:'pointer', color:'#f87171' }}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', background: 'rgba(0,0,0,0.1)' }}>
                  <TaskMediaGallery taskId={task.id} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const btnStyle = (bg: string, color: string) => ({
  padding:'0.5rem 1rem', borderRadius:8, border:'none', cursor:'pointer',
  background:bg, color, fontSize:'0.83rem', fontWeight:500,
});
