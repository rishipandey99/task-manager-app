import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

type User = { id: string; name: string; email: string };

function IconDashboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconTasks() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function IconTeam() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

export function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return;
    try {
      setUser(JSON.parse(raw) as User);
    } catch {
      setUser(null);
    }
  }, []);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">Task Manager</div>

        <div className="admin-user-card">
          <div className="admin-user-avatar" aria-hidden />
          <span className="admin-user-badge">Admin</span>
          <strong className="admin-user-name">{user?.name ?? 'User'}</strong>
          <span className="admin-user-email">{user?.email ?? ''}</span>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className={navClass} end>
            <IconDashboard />
            Dashboard
          </NavLink>
          <NavLink to="/admin/tasks" className={navClass}>
            <IconTasks />
            Manage Tasks
          </NavLink>
          <NavLink to="/admin/create-task" className={navClass}>
            <IconPlus />
            Create Task
          </NavLink>
          <NavLink to="/admin/team" className={navClass}>
            <IconTeam />
            Team Members
          </NavLink>
        </nav>

        <button type="button" className="admin-logout" onClick={logout}>
          <IconLogout />
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
