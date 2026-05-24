import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Edit2 } from 'lucide-react';
import { useAdminStore, type User } from '../store/adminStore';
import { usersApi } from '../api';
import { showToast } from './ToastContainer';

const schema = z.object({
  full_name: z.string().min(3, 'Min 3 characters'),
  email:     z.string().email('Valid email required'),
  phone:     z.string().min(10, '10 digit phone required'),
  role:      z.enum(['SUPER_ADMIN','ADMIN','OWNER','AGENT','CUSTOMER']),
  land_id:    z.string().optional().or(z.literal('')),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function EditUserModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { lands } = useAdminStore();
  const [selectedLands, setSelectedLands] = useState<string[]>(user.land_id ? user.land_id.split(',').map(s => s.trim()).filter(Boolean) : []);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      role: user.role as any,
      land_id: user.land_id || '',
      is_active: user.is_active,
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Overwrite land_id with comma-separated selected lands
      data.land_id = selectedLands.join(',');
      await usersApi.update(user.id, data);
      showToast('User Updated Successfully ✅', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const inp = { padding: '0.6rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box' as const };
  const lbl = { display: 'block', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, width: 600, padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}><Edit2 size={18}/> Edit User</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Login ID (Cannot be changed)</label>
              <input style={{ ...inp, opacity: 0.5 }} value={user.username} readOnly />
            </div>

            <div>
              <label style={lbl}>Full Name *</label>
              <input style={inp} {...register('full_name')}/>
              {errors.full_name && <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.full_name.message}</span>}
            </div>

            <div>
              <label style={lbl}>Email *</label>
              <input type="email" style={inp} {...register('email')}/>
              {errors.email && <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.email.message}</span>}
            </div>

            <div>
              <label style={lbl}>Phone *</label>
              <input style={inp} {...register('phone')}/>
              {errors.phone && <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.phone.message}</span>}
            </div>

            <div>
              <label style={lbl}>Role *</label>
              <select style={inp} {...register('role')}>
                <option value="CUSTOMER">Customer</option>
                <option value="AGENT">Agent</option>
                <option value="OWNER">Owner</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Assigned Lands (Select multiple)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', maxHeight: 150, overflowY: 'auto' }}>
                {lands.map(l => (
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
                {lands.length === 0 && <span style={{ color: '#64748b', fontSize: '0.8rem' }}>No lands available</span>}
              </div>
            </div>

            <div>
              <label style={lbl}>Status</label>
              <select style={inp} {...register('is_active', { setValueAs: v => v === 'true' })}>
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '0.6rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#1e293b', color: '#f1f5f9', fontWeight: 500, fontSize: '0.85rem' }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '0.6rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
              {isSubmitting ? 'Saving…' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
