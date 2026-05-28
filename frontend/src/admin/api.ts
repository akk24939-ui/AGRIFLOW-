const API_BASE = 'http://localhost:8005';

// ─── Token Management ──────────────────────────────────────────────────────
export const tokenManager = {
  getAccess:  ()      => localStorage.getItem('agriflow_access_token') || '',
  getRefresh: ()      => localStorage.getItem('agriflow_refresh_token') || '',
  set: (access: string, refresh: string) => {
    localStorage.setItem('agriflow_access_token', access);
    localStorage.setItem('agriflow_refresh_token', refresh);
  },
  clear: () => {
    localStorage.removeItem('agriflow_access_token');
    localStorage.removeItem('agriflow_refresh_token');
    localStorage.removeItem('agriflow_user');
  },
  getUser: () => {
    try { return JSON.parse(localStorage.getItem('agriflow_user') || 'null'); }
    catch { return null; }
  },
  setUser: (u: any) => localStorage.setItem('agriflow_user', JSON.stringify(u)),
};

// ─── Core Fetch ────────────────────────────────────────────────────────────
async function apiFetch(path: string, opts: RequestInit = {}, retry = true): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };
  const token = tokenManager.getAccess();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    const refresh = tokenManager.getRefresh();
    if (refresh) {
      const r = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (r.ok) {
        const data = await r.json();
        tokenManager.set(data.access_token, data.refresh_token);
        return apiFetch(path, opts, false);
      }
    }
    tokenManager.clear();
    window.location.href = '/admin/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    let errorMsg = err.detail || 'Request failed';
    if (Array.isArray(err.detail)) {
      errorMsg = err.detail.map((e: any) => e.msg).join(', ');
    }
    throw new Error(errorMsg);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (username: string, password: string) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    tokenManager.set(data.access_token, data.refresh_token);
    const user = await apiFetch('/api/auth/me');
    tokenManager.setUser(user);
    return user;
  },
  logout: async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    tokenManager.clear();
  },
  me: () => apiFetch('/api/auth/me'),
};

// ─── Users ─────────────────────────────────────────────────────────────────
export const usersApi = {
  list:   (params = '') => apiFetch(`/api/admin/users${params ? '?' + params : ''}`),
  get:    (id: string)  => apiFetch(`/api/admin/users/${id}`),
  create: (body: any)   => apiFetch('/api/admin/users', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: any) => apiFetch(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (id: string, body: any) => apiFetch(`/api/admin/users/${id}/change-password`, { method: 'PUT', body: JSON.stringify(body) }),
  toggleStatus: (id: string) => apiFetch(`/api/admin/users/${id}/toggle-status`, { method: 'PUT' }),
  unlock: (id: string)  => apiFetch(`/api/admin/users/${id}/unlock`, { method: 'PUT' }),
  delete: (id: string)  => apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' }),
};

// ─── Lands ─────────────────────────────────────────────────────────────────
export const landsApi = {
  list:   (search = '') => apiFetch(`/api/admin/lands${search ? '?search=' + search : ''}`),
  get:    (id: string)  => apiFetch(`/api/admin/lands/${id}`),
  create: (body: any)   => apiFetch('/api/admin/lands', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: any) => apiFetch(`/api/admin/lands/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string)  => apiFetch(`/api/admin/lands/${id}`, { method: 'DELETE' }),
};

// ─── Tasks ─────────────────────────────────────────────────────────────────
export const tasksApi = {
  list:   (params = '') => apiFetch(`/api/tasks${params ? '?' + params : ''}`),
  get:    (id: string)  => apiFetch(`/api/tasks/${id}`),
  create: (body: { title: string; description?: string; land_id?: string; assigned_to?: string; deadline?: string; priority?: string; category?: string; notes?: string; start_date?: string; status?: string; progress?: number }) => apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: any) => apiFetch(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string)  => apiFetch(`/api/tasks/${id}`, { method: 'DELETE' }),
  getMedia: (id: string) => apiFetch(`/api/tasks/${id}/media`),
  uploadMedia: async (id: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const token = tokenManager.getAccess();
    const res = await fetch(`${API_BASE}/api/tasks/${id}/media`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: fd
    });
    if (!res.ok) throw new Error('Upload failed');
  },
};

// ─── Dashboard & Logs ──────────────────────────────────────────────────────
export const adminApi = {
  dashboard:  () => apiFetch('/api/admin/dashboard'),
  loginLogs:  (params = '') => apiFetch(`/api/admin/login-logs${params ? '?' + params : ''}`),
  auditLogs:  (params = '') => apiFetch(`/api/admin/audit-logs${params ? '?' + params : ''}`),
  deleteAuditLog:    (id: string) => apiFetch(`/api/admin/audit-logs/${id}`, { method: 'DELETE' }),
  deleteAllAuditLogs: ()          => apiFetch(`/api/admin/audit-logs`,       { method: 'DELETE' }),
};

export const complaintsApi = {
  list: () => apiFetch('/api/complaints'),
  get: (id: string) => apiFetch(`/api/complaints/${id}`),
  create: (body: any) => apiFetch('/api/complaints', { method: 'POST', body: JSON.stringify(body) }),
  addMessage: (id: string, message: string) => apiFetch(`/api/complaints/${id}/messages`, { method: 'POST', body: JSON.stringify({ message }) }),
  updateStatus: (id: string, status: string) => apiFetch(`/api/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
