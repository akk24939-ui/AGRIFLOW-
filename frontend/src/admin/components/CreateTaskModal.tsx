import React, { useState, useRef } from 'react';
import { X, Calendar, Flag, Tag, MapPin, User as UserIcon, AlignLeft, Paperclip, Upload } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { tasksApi } from '../api';
import { showToast } from './ToastContainer';

export default function CreateTaskModal({ onClose }: { onClose: () => void }) {
  const { lands, users, adminUser, fetchTasks } = useAdminStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    land_id: '',
    assigned_to: '',
    priority: 'MEDIUM',
    category: 'FARMING',
    start_date: '',
    deadline: '',
    notes: '',
    status: 'PENDING'
  });

  // Filter lands based on role
  const availableLands = adminUser?.role === 'OWNER' 
    ? lands.filter(l => l.owner_id === adminUser.id) 
    : lands;
    
  const myLandIds = availableLands.map(l => l.land_id);

  // Filter agents based on selected land or all lands if no land selected
  const availableAgents = users.filter(u => {
    if (u.role !== 'AGENT') return false;
    if (form.land_id) return u.land_id === form.land_id;
    if (adminUser?.role === 'OWNER') return u.land_id && myLandIds.includes(u.land_id);
    return true; // Admin sees all
  });

  // Get customer name for the selected land
  const selectedLand = availableLands.find(l => l.land_id === form.land_id);
  const customerForLand = selectedLand?.customer_id
    ? users.find(u => u.id === selectedLand.customer_id)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Task title is required', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Create Task Record
      const task = await tasksApi.create({
        ...form,
        land_id: form.land_id || undefined,
        assigned_to: form.assigned_to || undefined,
        start_date: form.start_date || undefined,
        deadline: form.deadline || undefined,
      });

      // 2. Upload Attachment if provided (non-blocking — task still saved)
      if (selectedFile && task?.id) {
        try {
          await tasksApi.uploadMedia(task.id, selectedFile);
        } catch (uploadErr: any) {
          showToast('Task created but file upload failed: ' + (uploadErr.message || ''), 'error');
        }
      }

      showToast('Task assigned successfully!', 'success');
      await fetchTasks();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to assign task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inpClass = "ag-input";
  const lblClass = "ag-label";

  return (
    <div className="ag-modal-backdrop" onClick={onClose} style={{ zIndex: 1000, backdropFilter: 'blur(8px)' }}>
      <div className="ag-modal ag-modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '95%' }}>
        <div className="ag-modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h2 className="ag-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '6px 12px', borderRadius: 8 }}>📝 New Task</span>
            Assign Work
          </h2>
          <button className="ag-modal-close" onClick={onClose}><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ag-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="ag-form-group">
                <label className={lblClass}><AlignLeft size={14}/> Task Title *</label>
                <input className={inpClass} placeholder="e.g. Apply Fertilizer to Sector B" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required autoFocus />
              </div>

              <div className="ag-form-group">
                <label className={lblClass}>Description</label>
                <textarea className={inpClass} style={{ minHeight: '90px', resize: 'vertical' }} placeholder="Detailed instructions for the agent..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              <div className="ag-form-group">
                <label className={lblClass}><MapPin size={14}/> Select Land</label>
                <select className={`${inpClass} ag-select`} value={form.land_id} onChange={e => { setForm({...form, land_id: e.target.value, assigned_to: ''}); }}>
                  <option value="">-- No Specific Land (Global Task) --</option>
                  {availableLands.map(l => (
                    <option key={l.id} value={l.land_id}>{l.land_id} — {l.land_name}</option>
                  ))}
                </select>
              </div>

              {/* Auto-display Customer (Land Owner) */}
              {form.land_id && (
                <div className="ag-form-group" style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 8, padding: '0.65rem 0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 500, marginBottom: 4 }}>Customer (Land Owner)</label>
                  <div style={{ color: customerForLand ? '#38bdf8' : '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>
                    {customerForLand ? (
                      <>{customerForLand.full_name} <span style={{ color: '#475569', fontWeight: 400, fontSize: '0.78rem' }}>({customerForLand.email})</span></>
                    ) : (
                      <span style={{ fontStyle: 'italic', fontWeight: 400 }}>No customer linked to this land</span>
                    )}
                  </div>
                </div>
              )}

              <div className="ag-form-group">
                <label className={lblClass}><UserIcon size={14}/> Assign to Agent</label>
                <select className={`${inpClass} ag-select`} value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})}>
                  <option value="">-- Leave Unassigned --</option>
                  {availableAgents.map(a => (
                    <option key={a.id} value={a.id}>{a.full_name} ({a.land_id || 'No Land'})</option>
                  ))}
                </select>
                {form.land_id && availableAgents.length === 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: 4, display: 'block' }}>No agents linked to this land.</span>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="ag-form-group">
                  <label className={lblClass}><Flag size={14}/> Priority</label>
                  <select className={`${inpClass} ag-select`} value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                    <option value="LOW">Low 🟢</option>
                    <option value="MEDIUM">Medium 🟡</option>
                    <option value="HIGH">High 🔴</option>
                    <option value="CRITICAL">Critical ⚠️</option>
                  </select>
                </div>
                
                <div className="ag-form-group">
                  <label className={lblClass}><Tag size={14}/> Category</label>
                  <select className={`${inpClass} ag-select`} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="FARMING">🌾 Farming</option>
                    <option value="MAINTENANCE">🔧 Maintenance</option>
                    <option value="HARVEST">🚜 Harvest</option>
                    <option value="LOGISTICS">🚚 Logistics</option>
                    <option value="AUDIT">📋 Audit/Inspection</option>
                    <option value="OTHER">📁 Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="ag-form-group">
                  <label className={lblClass}><Calendar size={14}/> Start Date</label>
                  <input type="date" className={inpClass} value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
                </div>
                
                <div className="ag-form-group">
                  <label className={lblClass}><Calendar size={14}/> Deadline</label>
                  <input type="date" className={inpClass} value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
                </div>
              </div>

              <div className="ag-form-group">
                <label className={lblClass}>Internal Notes (Owner/Admin Only)</label>
                <input className={inpClass} placeholder="Budget info, secret notes..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>

              <div className="ag-form-group" style={{ background: 'rgba(56,189,248,0.05)', border: '1px dashed rgba(56,189,248,0.3)', padding: '1rem', borderRadius: 8 }}>
                <label className={lblClass} style={{ color: '#38bdf8' }}><Paperclip size={14}/> Attach Reference File (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: '#0f172a', border: '1px solid #1e293b', color: '#94a3b8', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                    <Upload size={14}/> Browse...
                  </button>
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{selectedFile ? selectedFile.name : 'No file chosen'}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 8 }}>Supports PDF, JPG, PNG. Max 5MB.</div>
              </div>
            </div>
          </div>

          <div className="ag-modal-footer" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button type="button" className="ag-btn ag-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="ag-btn ag-btn-primary" disabled={isSubmitting} style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              {isSubmitting ? 'Creating...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
