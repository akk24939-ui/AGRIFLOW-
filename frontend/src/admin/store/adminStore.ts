import { create } from 'zustand';
import { tokenManager, authApi, usersApi, landsApi, tasksApi, adminApi } from '../api';

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'OWNER' | 'CUSTOMER' | 'AGENT';

export interface AdminUser {
  id?: string;
  name: string;
  role: Role | string;
  username?: string;
  land_id?: string;
}

export interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  land_id?: string;
  is_active: boolean;
  is_deleted: boolean;
  failed_login_attempts: number;
  last_login?: string;
  created_at?: string;
  created_by?: string;
}

export interface Land {
  id: string;
  land_id: string;
  land_name?: string;
  district?: string;
  village?: string;
  owner_id?: string;
  customer_id?: string;
  created_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  category?: string;
  notes?: string;
  land_id?: string;
  assigned_to?: string;
  assigned_by?: string;
  start_date?: string;
  deadline?: string;
  created_at?: string;
}

export interface LoginLog {
  id: string;
  user_id?: string;
  login_time?: string;
  ip_address?: string;
  user_agent?: string;
  login_status: string;
  failed_reason?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performed_by: string;
  target_user?: string;
  details?: string;
  created_at?: string;
}

export interface DashboardStats {
  total_users: number;
  total_admins: number;
  total_owners: number;
  total_customers: number;
  total_agents: number;
  total_lands: number;
  active_lands: number;
  total_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  failed_logins: number;
  total_audit: number;
}

interface AdminStore {
  adminUser: AdminUser | null;
  setAdminUser: (u: AdminUser | null) => void;
  isAuthenticated: () => boolean;
  logout: () => Promise<void>;

  users: User[];
  setUsers: (u: User[]) => void;
  fetchUsers: (params?: string) => Promise<void>;

  lands: Land[];
  setLands: (l: Land[]) => void;
  fetchLands: (search?: string) => Promise<void>;

  tasks: Task[];
  setTasks: (t: Task[]) => void;
  fetchTasks: (params?: string) => Promise<void>;

  loginLogs: LoginLog[];
  auditLogs: AuditLog[];
  fetchLoginLogs: (params?: string) => Promise<void>;
  fetchAuditLogs: (params?: string) => Promise<void>;

  stats: DashboardStats | null;
  fetchStats: () => Promise<void>;

  loading: boolean;
  setLoading: (v: boolean) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;

  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const emptyStats: DashboardStats = {
  total_users: 0, total_admins: 0, total_owners: 0, total_customers: 0,
  total_agents: 0, total_lands: 0, active_lands: 0, total_tasks: 0,
  pending_tasks: 0, completed_tasks: 0, failed_logins: 0, total_audit: 0,
};

// Restore persisted admin user on page reload
function getPersistedUser(): AdminUser | null {
  try {
    const u = tokenManager.getUser();
    if (u && tokenManager.getAccess()) return { id: u.id, name: u.full_name, role: u.role, username: u.username, land_id: u.land_id };
  } catch { /* ignore */ }
  return null;
}

const getPersistedTheme = (): 'dark' | 'light' => {
  const saved = localStorage.getItem('agriflow_theme');
  return saved === 'light' ? 'light' : 'dark';
};

export const useAdminStore = create<AdminStore>((set, get) => ({
  adminUser: getPersistedUser(),
  setAdminUser: (u) => set({ adminUser: u }),
  isAuthenticated: () => !!get().adminUser && !!tokenManager.getAccess(),
  logout: async () => {
    await authApi.logout();
    set({ adminUser: null, users: [], lands: [], tasks: [], loginLogs: [], auditLogs: [], stats: null });
  },

  users: [],
  setUsers: (users) => set({ users }),
  fetchUsers: async (params = '') => {
    try {
      set({ loading: true });
      const data = await usersApi.list(params);
      set({ users: data });
    } finally { set({ loading: false }); }
  },

  lands: [],
  setLands: (lands) => set({ lands }),
  fetchLands: async (search = '') => {
    try {
      set({ loading: true });
      const data = await landsApi.list(search);
      set({ lands: data });
    } finally { set({ loading: false }); }
  },

  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  fetchTasks: async (params = '') => {
    try {
      set({ loading: true });
      const data = await tasksApi.list(params);
      set({ tasks: data });
    } finally { set({ loading: false }); }
  },

  loginLogs: [],
  auditLogs: [],
  fetchLoginLogs: async (params = '') => {
    try {
      const data = await adminApi.loginLogs(params);
      set({ loginLogs: data });
    } catch { /* silently fail */ }
  },
  fetchAuditLogs: async (params = '') => {
    try {
      const data = await adminApi.auditLogs(params);
      set({ auditLogs: data });
    } catch { /* silently fail */ }
  },

  stats: null,
  fetchStats: async () => {
    try {
      const data = await adminApi.dashboard();
      set({ stats: data });
    } catch { set({ stats: emptyStats }); }
  },

  loading: false,
  setLoading: (v) => set({ loading: v }),

  sidebarOpen: true,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),

  theme: getPersistedTheme(),
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('agriflow_theme', newTheme);
    document.documentElement.className = newTheme;
    return { theme: newTheme };
  }),
}));
