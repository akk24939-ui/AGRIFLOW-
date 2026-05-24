import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { User } from '../store/adminStore';
import { usersApi } from '../api';
import { showToast } from './ToastContainer';

export default function DeleteUserModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [step, setStep] = useState<1|2>(1);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await usersApi.delete(user.id);
      showToast(`User ${user.full_name} deleted (recoverable)`, 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ag-modal-backdrop" onClick={onClose}>
      <div className="ag-modal" style={{ maxWidth:460 }} onClick={e => e.stopPropagation()}>
        <div className="ag-modal-header">
          <h2 className="ag-modal-title" style={{ color:'var(--ag-red)' }}>
            <AlertTriangle size={18} style={{ marginRight:8 }}/>Delete User
          </h2>
          <button className="ag-modal-close" onClick={onClose}><X size={18}/></button>
        </div>

        {step === 1 && (
          <>
            <div style={{ textAlign:'center', padding:'12px 0 20px' }}>
              <div style={{ fontSize:3+'rem', marginBottom:12 }}>⚠️</div>
              <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', lineHeight:1.6 }}>
                Are you sure you want to delete <strong style={{ color:'var(--text-primary)' }}>{user.full_name}</strong>?
              </p>
              <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginTop:8 }}>
                This action uses soft delete (<code style={{ color:'var(--ag-green)' }}>is_deleted = true</code>).<br/>
                It can be recovered by Super Admin.
              </p>
            </div>

            <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, padding:'10px 14px', fontSize:'0.78rem', color:'var(--ag-red)', marginBottom:4 }}>
              Active sessions will be invalidated. Audit log will be created.
            </div>

            <div className="ag-modal-footer">
              <button className="ag-btn ag-btn-secondary" onClick={onClose}>Cancel</button>
              <button className="ag-btn ag-btn-danger" onClick={() => setStep(2)}>Continue →</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ textAlign:'center', padding:'12px 0 20px' }}>
              <div style={{ fontSize:3+'rem', marginBottom:12 }}>🗑️</div>
              <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>
                Final confirmation: Delete <strong style={{ color:'var(--text-primary)' }}>{user.full_name}</strong> ({user.role})?
              </p>
              <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:8 }}>
                Land: <code style={{ color:'var(--ag-blue)' }}>{user.land_id || 'None'}</code>
              </p>
            </div>
            <div className="ag-modal-footer">
              <button className="ag-btn ag-btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="ag-btn ag-btn-danger" onClick={handleDelete} disabled={loading}>
                {loading ? 'Deleting…' : '🗑️ Confirm Delete'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
