import { useEffect, useMemo, useState } from 'react';
import { TaskEditModal } from '../components/TaskEditModal';
import { getTasks, type Task } from '../services/taskService';
import { getUsers, type PublicUser } from '../services/userService';
import { getErrorMessage } from '../utils/error';
import { formatTableDate, priorityTagLabel, statusLabel } from '../utils/taskFormat';

type FilterKey = 'all' | 'pending' | 'in_progress' | 'completed';

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return `${s.slice(0, n).trim()}…`;
}

function currentUserId(): string {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return '';
    const u = JSON.parse(raw) as { id?: string };
    return u.id ? String(u.id) : '';
  } catch {
    return '';
  }
}

export function ManageTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const uid = currentUserId();

  async function refreshTasks() {
    const data = await getTasks();
    setTasks(data);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [taskData, userData] = await Promise.all([getTasks(), getUsers().catch(() => [])]);
        if (!cancelled) {
          setTasks(taskData);
          setUsers(userData);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(getErrorMessage(e, 'Failed to load tasks'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    return { total, pending, inProgress, completed };
  }, [tasks]);

  const filtered = useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  function downloadReport() {
    const rows = [
      ['Title', 'Status', 'Priority', 'Created', 'Progress', 'Assignees'],
      ...tasks.map((t) => [
        `"${(t.title || '').replace(/"/g, '""')}"`,
        statusLabel(t.status),
        priorityTagLabel(t.priority).replace(' Priority', ''),
        formatTableDate(t.createdAt),
        `${t.progressDone ?? 0}/${t.progressTotal ?? 5}`,
        `"${(t.assignees || []).map((a) => a.name).join('; ')}"`,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <h1 className="admin-page-title">My Tasks</h1>
        <button type="button" className="admin-btn-download" onClick={downloadReport}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
          </svg>
          Download Report
        </button>
      </div>

      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab${filter === 'all' ? ' admin-tab--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({counts.total})
        </button>
        <button
          type="button"
          className={`admin-tab${filter === 'pending' ? ' admin-tab--active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({counts.pending})
        </button>
        <button
          type="button"
          className={`admin-tab${filter === 'in_progress' ? ' admin-tab--active' : ''}`}
          onClick={() => setFilter('in_progress')}
        >
          In Progress ({counts.inProgress})
        </button>
        <button
          type="button"
          className={`admin-tab${filter === 'completed' ? ' admin-tab--active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({counts.completed})
        </button>
      </div>

      {error ? <p className="admin-banner-error">{error}</p> : null}

      {loading ? (
        <p className="admin-muted">Loading…</p>
      ) : (
        <div className="admin-task-grid">
          {filtered.map((task) => {
            const done = task.progressDone ?? 0;
            const total = task.progressTotal ?? 5;
            const pct = total > 0 ? Math.min(100, (done / total) * 100) : 0;
            const desc = task.description?.trim() || 'No description yet.';
            const assignees = task.assignees ?? [];
            const showAvatars = assignees.length
              ? assignees.slice(0, 5)
              : [null, null, null];

            return (
              <article key={task._id} className="admin-task-card">
                <div className="admin-task-card-tags">
                  <span className={`status-badge ${task.status}`}>{statusLabel(task.status)}</span>
                  <span className={`priority-pill priority-pill--${task.priority ?? 'medium'}`}>
                    {priorityTagLabel(task.priority)}
                  </span>
                </div>
                <h3 className="admin-task-card-title">{task.title}</h3>
                <p className="admin-task-card-desc">{truncate(desc, 140)}</p>
                <div className="admin-task-card-progress">
                  <div className="admin-task-card-progress-head">
                    <span>
                      Task Done: {done} / {total}
                    </span>
                  </div>
                  <div className="admin-progress-track">
                    <div
                      className={`admin-progress-fill${pct === 0 ? ' admin-progress-fill--empty' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="admin-task-card-dates">
                  <span>
                    Start: {task.startDate ? formatTableDate(task.startDate) : '—'}
                  </span>
                  <span>Due: {task.dueDate ? formatTableDate(task.dueDate) : '—'}</span>
                </div>

                {assignees.length ? (
                  <div className="admin-task-assignee-names">
                    {assignees.map((a) => (
                      <span key={a._id}>{a.name}</span>
                    ))}
                  </div>
                ) : null}

                <div className="admin-task-card-foot">
                  <div className="admin-mini-avatars">
                    {showAvatars.map((a, i) =>
                      a ? (
                        <span
                          key={a._id}
                          className="admin-mini-avatar-letter"
                          title={a.name}
                        >
                          {a.name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <span key={`ph-${i}`} className="admin-mini-avatar-placeholder" />
                      ),
                    )}
                  </div>
                  <div className="admin-task-card-actions">
                    <button type="button" className="admin-card-btn" onClick={() => setEditing(task)}>
                      Edit
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 ? (
        <p className="admin-muted">No tasks in this filter.</p>
      ) : null}

      {editing ? (
        <TaskEditModal
          task={editing}
          users={users}
          currentUserId={uid}
          onClose={() => setEditing(null)}
          onSaved={() => refreshTasks()}
          onDeleted={() => refreshTasks()}
        />
      ) : null}
    </div>
  );
}
