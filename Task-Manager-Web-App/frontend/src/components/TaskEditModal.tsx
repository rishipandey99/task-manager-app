import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import type { PublicUser } from '../services/userService';
import { deleteTask, updateTask, type Task } from '../services/taskService';
import { getErrorMessage } from '../utils/error';
import { MemberPicker } from './MemberPicker';

type Props = {
  task: Task;
  users: PublicUser[];
  currentUserId: string;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: (id: string) => void;
};

function taskAssigneeIds(task: Task): string[] {
  if (!task.assignees?.length) return [];
  return task.assignees.map((a) => a._id);
}

export function TaskEditModal({ task, users, currentUserId, onClose, onSaved, onDeleted }: Props) {
  const ownerId = task.user?._id;
  const isOwner = ownerId != null && String(ownerId) === String(currentUserId);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [status, setStatus] = useState<Task['status']>(task.status);
  const [priority, setPriority] = useState<Task['priority']>(task.priority ?? 'medium');
  const [progressDone, setProgressDone] = useState(task.progressDone ?? 0);
  const [progressTotal, setProgressTotal] = useState(task.progressTotal ?? 5);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.slice(0, 10) : '',
  );
  const [startDate, setStartDate] = useState(
    task.startDate ? task.startDate.slice(0, 10) : '',
  );
  const [assigneeIds, setAssigneeIds] = useState<string[]>(() => taskAssigneeIds(task));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateTask(task._id, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        progressDone: Number(progressDone),
        progressTotal: Number(progressTotal),
        dueDate: dueDate || undefined,
        startDate: startDate || undefined,
        assignees: assigneeIds,
      });
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Save failed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!isOwner) return;
    if (!window.confirm('Delete this task?')) return;
    setError(null);
    setDeleting(true);
    try {
      await deleteTask(task._id);
      onDeleted(task._id);
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Delete failed'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-dialog"
        role="dialog"
        aria-labelledby="edit-task-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="edit-task-title">Edit Task</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="admin-field">
            <label htmlFor="edit-title">Title</label>
            <input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="admin-field">
            <label htmlFor="edit-desc">Description</label>
            <textarea
              id="edit-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="admin-field-row">
            <div className="admin-field">
              <label htmlFor="edit-status">Status</label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Task['status'])}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor="edit-priority">Priority</label>
              <select
                id="edit-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="admin-field-row">
            <div className="admin-field">
              <label htmlFor="edit-done">Progress done</label>
              <input
                id="edit-done"
                type="number"
                min={0}
                value={progressDone}
                onChange={(e) => setProgressDone(Number(e.target.value))}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="edit-total">Progress total</label>
              <input
                id="edit-total"
                type="number"
                min={1}
                value={progressTotal}
                onChange={(e) => setProgressTotal(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="admin-field-row">
            <div className="admin-field">
              <label htmlFor="edit-start">Start date</label>
              <input
                id="edit-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="edit-due">Due date</label>
              <input id="edit-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="admin-field">
            <span className="admin-field-label">Assign members</span>
            <MemberPicker users={users} selectedIds={assigneeIds} onChange={setAssigneeIds} />
          </div>

          {error ? <p className="admin-banner-error">{error}</p> : null}

          <div className="modal-actions">
            {isOwner ? (
              <button
                type="button"
                className="modal-btn-danger"
                onClick={handleDelete}
                disabled={deleting || saving}
              >
                {deleting ? 'Deleting…' : 'Delete task'}
              </button>
            ) : (
              <span className="admin-muted modal-owner-hint">Only the task owner can delete this task.</span>
            )}
            <div className="modal-actions-right">
              <button type="button" className="modal-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="modal-btn-primary" disabled={saving || deleting}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
