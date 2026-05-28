import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../admin/store/adminStore';
import { LogOut, Clock, AlertCircle, ClipboardList, Moon, Sun } from 'lucide-react';
import AgentTaskDetails from './AgentTaskDetails';
import ComplaintsPanel from '../admin/components/ComplaintsPanel';
import './agent.css';

export default function AgentApp() {
  const navigate = useNavigate();
  const { adminUser, tasks, fetchTasks, logout, theme, toggleTheme } = useAdminStore();

  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'complaints'>('tasks');

  useEffect(() => {
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }
    if (adminUser.role !== 'AGENT' && adminUser.role !== 'WORKER') {
      // Wrong role — redirect to login
      navigate('/admin/login');
      return;
    }
    fetchTasks();
  }, [adminUser]);


  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const myTasks = tasks.filter(t => t.assigned_to === adminUser?.id);
  const pending   = myTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
  const completed = myTasks.filter(t => t.status === 'COMPLETED');

  if (!adminUser) return null;

  if (selectedTask && activeTab === 'tasks') {
    const freshTask = tasks.find(t => t.id === selectedTask.id) || selectedTask;
    return <AgentTaskDetails task={freshTask} onBack={() => setSelectedTask(null)} />;
  }

  return (
    <div className="agent-app">
      {/* Mobile Header */}
      <header className="agent-header">
        <div className="agent-profile">
          <div className="agent-avatar">{adminUser.name.charAt(0)}</div>
          <div>
            <h3>{adminUser.name}</h3>
            <span>Field Agent • {adminUser.land_id || 'No Land'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={toggleTheme} className="agent-logout" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={handleLogout} className="agent-logout"><LogOut size={20} /></button>
        </div>
      </header>

      {/* Tab Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'var(--bg-surface)' }}>
        <button
          onClick={() => setActiveTab('tasks')}
          style={{
            flex: 1, padding: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
            background: 'transparent',
            color: activeTab === 'tasks' ? '#22c55e' : 'var(--text-muted)',
            borderBottom: activeTab === 'tasks' ? '2px solid #22c55e' : '2px solid transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <ClipboardList size={16} /> My Tasks
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          style={{
            flex: 1, padding: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
            background: 'transparent',
            color: activeTab === 'complaints' ? '#f87171' : 'var(--text-muted)',
            borderBottom: activeTab === 'complaints' ? '2px solid #f87171' : '2px solid transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <AlertCircle size={16} /> Complaints
        </button>
      </div>

      {/* Main Content */}
      {activeTab === 'tasks' ? (
        <main className="agent-main">
          <div className="agent-stats">
            <div className="stat-box active">
              <h2>{pending.length}</h2>
              <p>To Do</p>
            </div>
            <div className="stat-box done">
              <h2>{completed.length}</h2>
              <p>Done</p>
            </div>
          </div>

          <h2 className="section-title">My Tasks</h2>

          {myTasks.length === 0 ? (
            <div className="empty-state">
              <Clock size={40} color='var(--text-secondary)' />
              <p>You have no assigned tasks yet.</p>
            </div>
          ) : (
            <div className="task-list">
              {myTasks.map(task => (
                <div key={task.id} className={`mobile-task-card ${task.status === 'COMPLETED' ? 'completed' : ''}`} onClick={() => setSelectedTask(task)}>
                  <div className="task-head">
                    <h4>{task.title}</h4>
                    <span className={`task-badge ${task.status.toLowerCase()}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  {task.description && <p className="task-desc">{task.description}</p>}
                  <div className="task-meta">
                    {task.deadline && <span><Clock size={12}/> Due {new Date(task.deadline).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      ) : (
        <div style={{ background: 'var(--bg-base)', minHeight: 'calc(100vh - 130px)' }}>
          <ComplaintsPanel mode="agent" currentUser={adminUser} />
        </div>
      )}
    </div>
  );
}
