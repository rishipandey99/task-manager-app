import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTasks, type Task } from '../services/taskService';
import { getErrorMessage } from '../utils/error';
import {
  formatHeaderDate,
  formatTableDate,
  greetingForHour,
  priorityLabel,
  statusLabel,
} from '../utils/taskFormat';

type User = { id: string; name: string; email: string };

function TaskDonut({ pending, inProgress, completed }: { pending: number; inProgress: number; completed: number }) {
  const total = pending + inProgress + completed;
  if (total === 0) {
    return (
      <div className="admin-donut admin-donut--empty">
        <span className="admin-donut-hole" />
      </div>
    );
  }
  const p = pending / total;
  const i = inProgress / total;
  const a1 = p;
  const a2 = p + i;
  const style = {
    background: `conic-gradient(
      #a78bfa 0turn ${a1}turn,
      #22d3ee ${a1}turn ${a2}turn,
      #4ade80 ${a2}turn 1turn
    )`,
  } as CSSProperties;

  return (
    <div className="admin-donut" style={style}>
      <div className="admin-donut-hole">
        <span className="admin-donut-total">{total}</span>
        <span className="admin-donut-label">Total</span>
      </div>
    </div>
  );
}

function PriorityBars({ low, medium, high }: { low: number; medium: number; high: number }) {
  const max = Math.max(low, medium, high, 1);
  return (
    <div className="admin-bar-chart">
      <div className="admin-bar-y">
        {[8, 6, 4, 2, 0].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
      <div className="admin-bar-bars">
        <div className="admin-bar-col">
          <div
            className="admin-bar-fill admin-bar-fill--low"
            style={{ height: `${(low / max) * 100}%` }}
          />
          <span>Low</span>
        </div>
        <div className="admin-bar-col">
          <div
            className="admin-bar-fill admin-bar-fill--medium"
            style={{ height: `${(medium / max) * 100}%` }}
          />
          <span>Medium</span>
        </div>
        <div className="admin-bar-col">
          <div
            className="admin-bar-fill admin-bar-fill--high"
            style={{ height: `${(high / max) * 100}%` }}
          />
          <span>High</span>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return;
    try {
      setUser(JSON.parse(raw) as User);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTasks();
        if (!cancelled) setTasks(data);
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

  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const low = tasks.filter((t) => (t.priority ?? 'medium') === 'low').length;
    const medium = tasks.filter((t) => (t.priority ?? 'medium') === 'medium').length;
    const high = tasks.filter((t) => (t.priority ?? 'medium') === 'high').length;
    return { total, pending, inProgress, completed, low, medium, high };
  }, [tasks]);

  const recent = useMemo(() => {
    return [...tasks]
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      })
      .slice(0, 10);
  }, [tasks]);

  const now = new Date();
  const greet = greetingForHour(user?.name ?? 'there', now.getHours());

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-greeting">{greet}</h1>
          <p className="admin-date-line">{formatHeaderDate(now)}</p>
        </div>
      </header>

      {error ? <p className="admin-banner-error">{error}</p> : null}

      <section className="admin-stat-row">
        <div className="admin-stat admin-stat--blue">
          <span className="admin-stat-value">{stats.total}</span>
          <span className="admin-stat-label">Total Tasks</span>
        </div>
        <div className="admin-stat admin-stat--purple">
          <span className="admin-stat-value">{stats.pending}</span>
          <span className="admin-stat-label">Pending Tasks</span>
        </div>
        <div className="admin-stat admin-stat--cyan">
          <span className="admin-stat-value">{stats.inProgress}</span>
          <span className="admin-stat-label">In Progress</span>
        </div>
        <div className="admin-stat admin-stat--green">
          <span className="admin-stat-value">{stats.completed}</span>
          <span className="admin-stat-label">Completed Tasks</span>
        </div>
      </section>

      <section className="admin-cards-row">
        <div className="admin-panel">
          <h2 className="admin-panel-title">Task Distribution</h2>
          {loading ? (
            <p className="admin-muted">Loading…</p>
          ) : (
            <>
              <div className="admin-donut-wrap">
                <TaskDonut
                  pending={stats.pending}
                  inProgress={stats.inProgress}
                  completed={stats.completed}
                />
              </div>
              <div className="admin-legend">
                <span>
                  <i className="admin-dot admin-dot--pending" /> Pending
                </span>
                <span>
                  <i className="admin-dot admin-dot--progress" /> In Progress
                </span>
                <span>
                  <i className="admin-dot admin-dot--done" /> Completed
                </span>
              </div>
            </>
          )}
        </div>

        <div className="admin-panel">
          <h2 className="admin-panel-title">Task Priority Levels</h2>
          {loading ? (
            <p className="admin-muted">Loading…</p>
          ) : (
            <PriorityBars low={stats.low} medium={stats.medium} high={stats.high} />
          )}
        </div>
      </section>

      <section className="admin-panel admin-panel--table">
        <div className="admin-section-head">
          <h2 className="admin-panel-title admin-panel-title--inline">Recent Tasks</h2>
          <Link to="/admin/tasks" className="admin-link-all">
            See All →
          </Link>
        </div>
        {loading ? (
          <p className="admin-muted">Loading…</p>
        ) : recent.length === 0 ? (
          <p className="admin-muted">No tasks yet. Create one from the sidebar.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created On</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t._id}>
                    <td className="admin-td-name">{t.title}</td>
                    <td>
                      <span className={`status-badge ${t.status}`}>{statusLabel(t.status)}</span>
                    </td>
                    <td>
                      <span className={`priority-badge priority-${t.priority ?? 'medium'}`}>
                        {priorityLabel(t.priority)}
                      </span>
                    </td>
                    <td className="admin-td-date">{formatTableDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
