import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemberPicker } from '../components/MemberPicker';
import { createTask } from '../services/taskService';
import { getUsers } from '../services/userService';
import { getErrorMessage } from '../utils/error';

export function CreateTask() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [checklistDraft, setChecklistDraft] = useState('');
  const [checklist, setChecklist] = useState<string[]>([]);
  const [linkDraft, setLinkDraft] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [users, setUsers] = useState<Awaited<ReturnType<typeof getUsers>>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const list = await getUsers();
        if (!c) setUsers(list);
      } catch {
        if (!c) setUsers([]);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  function addChecklistItem() {
    const t = checklistDraft.trim();
    if (!t) return;
    setChecklist((c) => [...c, t]);
    setChecklistDraft('');
  }

  function addAttachment() {
    const t = linkDraft.trim();
    if (!t) return;
    setAttachments((a) => [...a, t]);
    setLinkDraft('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const extra: string[] = [];
    if (checklist.length) {
      extra.push('Checklist:\n' + checklist.map((x) => `- ${x}`).join('\n'));
    }
    if (attachments.length) {
      extra.push('Attachments:\n' + attachments.join('\n'));
    }
    const fullDescription = [description.trim(), ...extra].filter(Boolean).join('\n\n');

    setError(null);
    setLoading(true);
    try {
      await createTask({
        title: title.trim(),
        description: fullDescription || undefined,
        priority,
        dueDate: dueDate || undefined,
        startDate: startDate || undefined,
        status: 'pending',
        assignees: assigneeIds.length ? assigneeIds : undefined,
      });
      navigate('/admin/tasks');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to create task'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page admin-page--narrow">
      <div className="admin-form-card">
        <h1 className="admin-form-title">Create Task</h1>

        <form onSubmit={handleSubmit} className="admin-create-form">
          <div className="admin-field">
            <label htmlFor="ct-title">Task Title</label>
            <input
              id="ct-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Create App UI"
              required
            />
          </div>

          <div className="admin-field">
            <label htmlFor="ct-desc">Description</label>
            <textarea
              id="ct-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe task."
              rows={4}
            />
          </div>

          <div className="admin-field-row">
            <div className="admin-field">
              <label htmlFor="ct-priority">Priority</label>
              <select
                id="ct-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor="ct-due">Due Date</label>
              <input
                id="ct-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="ct-start">Start Date</label>
            <input
              id="ct-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="admin-field">
            <span className="admin-field-label">Assign To</span>
            <MemberPicker users={users} selectedIds={assigneeIds} onChange={setAssigneeIds} />
          </div>

          <div className="admin-field">
            <label>TODO Checklist</label>
            <div className="admin-inline-add">
              <input
                value={checklistDraft}
                onChange={(e) => setChecklistDraft(e.target.value)}
                placeholder="Enter Task"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
              />
              <button type="button" className="admin-btn-add" onClick={addChecklistItem}>
                + Add
              </button>
            </div>
            {checklist.length ? (
              <ul className="admin-chips">
                {checklist.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="admin-field">
            <label>Add Attachments</label>
            <div className="admin-inline-add">
              <input
                value={linkDraft}
                onChange={(e) => setLinkDraft(e.target.value)}
                placeholder="Add File Link"
              />
              <button type="button" className="admin-btn-add" onClick={addAttachment}>
                + Add
              </button>
            </div>
            {attachments.length ? (
              <ul className="admin-chips">
                {attachments.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            ) : null}
          </div>

          {error ? <p className="admin-banner-error">{error}</p> : null}

          <button type="submit" className="admin-btn-submit" disabled={loading}>
            {loading ? 'CREATING…' : 'CREATE TASK'}
          </button>
        </form>
      </div>
    </div>
  );
}
