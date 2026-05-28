import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
// removed
import { usersApi } from '../api';
import { showToast } from './ToastContainer';

const schema = z.object({
  fullName:  z.string().min(3, 'Min 3 characters'),
  email:     z.string().email('Valid email required'),
  phone:     z.string().min(10, '10 digit phone required'),
  role: z.enum(['SUPER_ADMIN','ADMIN','OWNER','AGENT','CUSTOMER']),
  landId: z.string().optional().or(z.literal('')),
  password: z.string().min(8, 'Min 8 characters'),
  confirm:   z.string(),
  status:    z.enum(['ACTIVE','DISABLED']),
}).refine(d => d.password === d.confirm, { message:'Passwords do not match', path:['confirm'] });

type FormData = z.infer<typeof schema>;

export default function CreateUserModal({ onClose }: { onClose: () => void }) {
  const { lands, adminUser } = useAdminStore();
  const [selectedLands, setSelectedLands] = useState<string[]>([]);
  const { register, handleSubmit, formState:{ errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role:'CUSTOMER', status:'ACTIVE' }
  });

  const availableLands = adminUser?.role === 'OWNER' ? lands.filter(l => l.owner_id === adminUser.id) : lands;

  const onSubmit = async (data: FormData) => {
    try {
      await usersApi.create({
        full_name: data.fullName,
        username: data.email,
        email: data.email,
        phone: data.phone,
        role: data.role,
        land_id: selectedLands.join(','),
        password: data.password,
        status: data.status,
      });
      showToast('User Created Successfully ✅', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="ag-modal-backdrop" onClick={onClose}>
      <div className="ag-modal ag-modal-lg" onClick={e=>e.stopPropagation()}>
        <div className="ag-modal-header">
          <h2 className="ag-modal-title">➕ Create New User</h2>
          <button className="ag-modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="ag-form-grid">
            <div className="ag-form-group">
              <label className="ag-label">Full Name *</label>
              <input className="ag-input" placeholder="e.g. Panimugil Rajan" {...register('fullName')}/>
              {errors.fullName && <span className="ag-error">{errors.fullName.message}</span>}
            </div>

            <div className="ag-form-group">
              <label className="ag-label">Email *</label>
              <input className="ag-input" type="email" placeholder="user@agriflow.in" {...register('email')}/>
              {errors.email && <span className="ag-error">{errors.email.message}</span>}
            </div>
            <div className="ag-form-group">
              <label className="ag-label">Phone *</label>
              <input className="ag-input" placeholder="9876543210" {...register('phone')}/>
              {errors.phone && <span className="ag-error">{errors.phone.message}</span>}
            </div>
            <div className="ag-form-group">
              <label className="ag-label">Role *</label>
              <select className="ag-input ag-select" {...register('role')}>
                <option value="CUSTOMER">Customer</option>
                <option value="AGENT">Worker / Agent</option>
                {adminUser?.role !== 'OWNER' && <option value="OWNER">Owner</option>}
                {adminUser?.role !== 'OWNER' && <option value="ADMIN">Admin</option>}
              </select>
            </div>
            <div className="ag-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="ag-label">Assigned Lands (Select multiple)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: 'var(--bg-elevated)', padding: '10px', borderRadius: 8, border: '1px solid var(--glass-border)', maxHeight: 150, overflowY: 'auto' }}>
                {availableLands.map(l => (
                  <label key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: selectedLands.includes(l.land_id) ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)', color: selectedLands.includes(l.land_id) ? '#38bdf8' : '#cbd5e1', padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', cursor: 'pointer', border: `1px solid ${selectedLands.includes(l.land_id) ? 'rgba(56,189,248,0.3)' : 'transparent'}` }}>
                    <input 
                      type="checkbox" 
                      style={{ display: 'none' }}
                      checked={selectedLands.includes(l.land_id)} 
                      onChange={(e) => {
                        if (e.target.checked) setSelectedLands([...selectedLands, l.land_id]);
                        else setSelectedLands(selectedLands.filter(id => id !== l.land_id));
                      }} 
                    />
                    {l.land_id} - {l.land_name || 'No Name'}
                  </label>
                ))}
                {availableLands.length === 0 && <span style={{ color: '#64748b', fontSize: '0.8rem' }}>No lands available</span>}
              </div>
            </div>
            <div className="ag-form-group">
              <label className="ag-label">Password *</label>
              <input className="ag-input" type="password" placeholder="Min 8 chars, upper, number, symbol" {...register('password')}/>
              {errors.password && <span className="ag-error">{errors.password.message}</span>}
            </div>
            <div className="ag-form-group">
              <label className="ag-label">Confirm Password *</label>
              <input className="ag-input" type="password" placeholder="Repeat password" {...register('confirm')}/>
              {errors.confirm && <span className="ag-error">{errors.confirm.message}</span>}
            </div>
            <div className="ag-form-group">
              <label className="ag-label">Status</label>
              <select className="ag-input ag-select" {...register('status')}>
                <option value="ACTIVE">Active</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>
          </div>

          <div style={{ background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.15)', borderRadius:8, padding:'10px 14px', fontSize:'0.78rem', color:'var(--text-muted)', marginTop:16 }}>
            🔐 Password will be hashed with bcrypt before storage. User must change on first login.
          </div>

          <div className="ag-modal-footer">
            <button type="button" className="ag-btn ag-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="ag-btn ag-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : '✅ Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
