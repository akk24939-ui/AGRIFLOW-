import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Camera, Video, FileText, Save, FileImage } from 'lucide-react';
import { useAdminStore, type Task } from '../admin/store/adminStore';
import { tasksApi } from '../admin/api';
import { showToast } from '../admin/components/ToastContainer';
import './agent.css';

const MEDIA_BASE = 'http://localhost:8005';

interface Props {
  task: Task;
  onBack: () => void;
}

export default function AgentTaskDetails({ task, onBack }: Props) {
  const { fetchTasks } = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState(task.status);
  const [mediaList, setMediaList] = useState<any[]>([]);
  
  // Mobile Native Hidden Inputs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    try {
      const data = await tasksApi.getMedia(task.id);
      setMediaList(data);
    } catch (err) {
      console.error('Failed to load media');
    }
  };

  useEffect(() => {
    loadMedia();
  }, [task.id]);

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      await tasksApi.uploadMedia(task.id, file);
      showToast('Proof uploaded successfully! 🎉', 'success');
      loadMedia(); // refresh list
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUpdate = async () => {
    setLoading(true);
    try {
      // In a real app, you'd save notes to a comments/timeline table
      await tasksApi.update(task.id, { status, description: notes ? task.description + "\nNotes: " + notes : task.description });
      await fetchTasks();
      showToast('Task updated successfully!', 'success');
      onBack();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agent-task-details">
      <header className="details-header">
        <button onClick={onBack} className="btn-back"><ChevronLeft size={24} /></button>
        <h3>Task Details</h3>
        <div style={{ width: 24 }} />
      </header>

      <main className="details-main">
        {/* Task Info Card */}
        <div className="mobile-task-card" style={{ marginBottom: '1.5rem' }}>
          <div className="task-head">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>LAND ID : {task.land_id || 'N/A'}</span>
            <span className={`task-badge ${task.status.toLowerCase()}`}>{task.status.replace('_', ' ')}</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', margin: '0.5rem 0', color: ('var(--text-primary)') }}>{task.title}</h2>
          {task.deadline && (
            <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
              Deadline: {new Date(task.deadline).toLocaleDateString()}
            </div>
          )}
          
          <div className="details-desc-box">
            <strong>Description:</strong>
            <p>{task.description || 'No description provided.'}</p>
          </div>
        </div>

        {/* Previous Uploads */}
        {mediaList.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 className="section-title">Previous Uploads</h4>
            <div className="media-gallery" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
              {mediaList.map((m: any) => (
                <div key={m.id} style={{ minWidth: '100px', height: '100px', background: 'var(--bg-card)', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {m.file_type.startsWith('image/') ? (
                    <img src={`${MEDIA_BASE}${m.file_url}`} alt="proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : m.file_type.startsWith('video/') ? (
                    <video src={`${MEDIA_BASE}${m.file_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <FileImage size={32} color='var(--text-muted)' />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Center */}
        <h4 className="section-title">Upload Center</h4>
        <div className="upload-grid">
          <button className="upload-btn" onClick={() => photoInputRef.current?.click()} disabled={loading}>
            <Camera size={24} color="#38bdf8" />
            <span>Capture Photo</span>
          </button>
          
          <button className="upload-btn" onClick={() => videoInputRef.current?.click()} disabled={loading}>
            <Video size={24} color="#ef4444" />
            <span>Record Video</span>
          </button>
          
          <button className="upload-btn" onClick={() => fileInputRef.current?.click()} disabled={loading}>
            <FileText size={24} color="#22c55e" />
            <span>Upload PDF</span>
          </button>
        </div>

        {/* Hidden Inputs for Native Mobile Triggers */}
        {/* capture="environment" forces the native back camera on mobile */}
        <input type="file" accept="image/*" capture="environment" ref={photoInputRef} style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
        <input type="file" accept="video/*" capture="environment" ref={videoInputRef} style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
        <input type="file" accept="application/pdf,image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />

        {/* Work Notes */}
        <h4 className="section-title" style={{ marginTop: '1.5rem' }}>Work Notes</h4>
        <textarea 
          className="agent-textarea" 
          placeholder="Add your progress notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Task Status */}
        <h4 className="section-title" style={{ marginTop: '1.5rem' }}>Task Status</h4>
        <div className="status-options">
          {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map(s => (
            <label key={s} className={`status-radio ${status === s ? 'selected' : ''}`}>
              <input 
                type="radio" 
                name="status" 
                value={s} 
                checked={status === s} 
                onChange={() => setStatus(s)}
                style={{ display: 'none' }}
              />
              {s === 'PENDING' ? 'Pending' : s === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
            </label>
          ))}
        </div>

        <button className="btn-save-update" onClick={handleSaveUpdate} disabled={loading}>
          {loading ? 'Saving...' : <><Save size={18} /> Save Update</>}
        </button>

      </main>
    </div>
  );
}
