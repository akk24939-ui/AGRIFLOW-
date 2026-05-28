import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, KeyRound } from 'lucide-react';
import type { User } from '../store/adminStore';
import { usersApi } from '../api';
import { showToast } from './ToastContainer';

const schema = z.object({
  newPassword: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special symbol'),
  confirm: z.string(),
}).refine(d => d.newPassword === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

type FormData = z.infer<typeof schema>;

export default function ChangePasswordModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const pwd = watch('newPassword') ?? '';
  const strength = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/, /.{8,}/].filter(r => r.test(pwd)).length;
  const strengthColor = ['var(--ag-red)','var(--ag-red)','var(--ag-yellow)','var(--ag-yellow)','var(--ag-green)'][strength] ?? 'var(--ag-red)';
  const strengthLabel = ['','Weak','Weak','Fair','Strong','Very Strong'][strength] ?? '';

  const onSubmit = async (data: FormData) => {
    try {
      await usersApi.changePassword(user.id, { new_password: data.newPassword, confirm_password: data.confirm });
      showToast(`Password updated for ${user.full_name}`, 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="ag-modal-backdrop" onClick={onClose}>
      <div className="ag-modal" onClick={e => e.stopPropagation()}>
        <div className="ag-modal-header">
          <h2 className="ag-modal-title"><KeyRound size={18} style={{marginRight:8}}/>Change Password</h2>
          <button className="ag-modal-close" onClick={onClose}><X size={18}/></button>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--bg-elevated)', borderRadius:8, marginBottom:20 }}>
          <div style={{ width:36, height:36, borderRadius:8, background:'linear-gradient(135deg,var(--ag-green),var(--ag-blue))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff' }}>
            {user.full_name[0]}
          </div>
          <div>
            <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'0.875rem' }}>{user.full_name}</div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{user.email} · {user.role}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="ag-form-group">
              <label className="ag-label">New Password *</label>
              <input className="ag-input" type="password" placeholder="New secure password" {...register('newPassword')}/>
              {errors.newPassword && <span className="ag-error">{errors.newPassword.message}</span>}
              {pwd && (
                <div style={{ marginTop:6 }}>
                  <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ height:3, flex:1, borderRadius:2, background: i <= strength ? strengthColor : 'var(--bg-elevated)' }}/>
                    ))}
                  </div>
                  <span style={{ fontSize:'0.72rem', color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>
            <div className="ag-form-group">
              <label className="ag-label">Confirm Password *</label>
              <input className="ag-input" type="password" placeholder="Repeat password" {...register('confirm')}/>
              {errors.confirm && <span className="ag-error">{errors.confirm.message}</span>}
            </div>
          </div>

          <div style={{ background:'rgba(56,189,248,0.06)', border:'1px solid rgba(56,189,248,0.15)', borderRadius:8, padding:'10px 14px', fontSize:'0.75rem', color:'var(--text-muted)', marginTop:16 }}>
            ℹ️ All active sessions for this user will be invalidated. User must re-login.
          </div>

          <div className="ag-modal-footer">
            <button type="button" className="ag-btn ag-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="ag-btn ag-btn-primary" disabled={isSubmitting}>
              🔑 Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
