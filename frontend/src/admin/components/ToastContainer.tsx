import { useState } from 'react';

export interface Toast { id: string; message: string; type: 'success'|'error'|'info'; }

let _setToasts: React.Dispatch<React.SetStateAction<Toast[]>> | null = null;

export function showToast(message: string, type: Toast['type'] = 'success') {
  if (!_setToasts) return;
  const id = Date.now().toString();
  _setToasts(prev => [...prev, { id, message, type }]);
  setTimeout(() => {
    _setToasts?.(prev => prev.filter(t => t.id !== id));
  }, 3500);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  _setToasts = setToasts;

  return (
    <div className="ag-toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`ag-toast ag-toast-${t.type}`}>
          <span style={{ fontSize:'1.1rem' }}>
            {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="ag-toast-msg">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
