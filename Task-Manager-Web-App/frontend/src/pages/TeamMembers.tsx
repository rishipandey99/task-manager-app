import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { createTeamMember, deleteTeamMember, getUsers, type PublicUser } from '../services/userService';
import { getErrorMessage } from '../utils/error';

export function TeamMembers() {
  const [members, setMembers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const list = await getUsers();
      setMembers(list);
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to load members'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return;
    try {
      const u = JSON.parse(raw) as { id?: string };
      if (u.id) setCurrentUserId(u.id);
    } catch {
      setCurrentUserId(null);
    }
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createTeamMember({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      setName('');
      setEmail('');
      setPassword('');
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not add member'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(member: PublicUser) {
    if (member.id === currentUserId) return;
    const ok = window.confirm(
      `Remove ${member.name} (${member.email})? Tasks they owned will be transferred to your account.`,
    );
    if (!ok) return;
    setDeletingId(member.id);
    setError(null);
    try {
      await deleteTeamMember(member.id);
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not remove member'));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Team Members</h1>
      <p className="admin-muted admin-subhead">
        Add teammates here so you can assign them to tasks.
      </p>

      <div className="admin-panel admin-add-member">
        <h2 className="admin-panel-title">Add member</h2>
        <form onSubmit={handleAdd} className="admin-add-member-form">
          <div className="admin-field-row admin-add-member-row">
            <div className="admin-field">
              <label htmlFor="tm-name">Name</label>
              <input
                id="tm-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Full name"
              />
            </div>
            <div className="admin-field">
              <label htmlFor="tm-email">Email</label>
              <input
                id="tm-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
              />
            </div>
            <div className="admin-field">
              <label htmlFor="tm-pass">Password</label>
              <input
                id="tm-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min 8 characters"
              />
            </div>
            <div className="admin-field admin-add-member-submit">
              <label className="admin-field-label">&nbsp;</label>
              <button type="submit" className="admin-btn-submit admin-btn-submit--inline" disabled={saving}>
                {saving ? 'Adding…' : 'Add member'}
              </button>
            </div>
          </div>
        </form>
        {error ? <p className="admin-banner-error">{error}</p> : null}
      </div>

      <div className="admin-panel admin-panel--table">
        {loading ? (
          <p className="admin-muted">Loading…</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="admin-member-cell">
                        <span className="admin-member-avatar" />
                        <strong>{m.name}</strong>
                      </div>
                    </td>
                    <td>{m.email}</td>
                    <td>
                      <span className="admin-role-pill">Member</span>
                    </td>
                    <td>
                      {m.id === currentUserId ? (
                        <span className="admin-muted">—</span>
                      ) : (
                        <button
                          type="button"
                          className="admin-member-delete"
                          onClick={() => handleDelete(m)}
                          disabled={deletingId === m.id}
                        >
                          {deletingId === m.id ? 'Removing…' : 'Delete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
