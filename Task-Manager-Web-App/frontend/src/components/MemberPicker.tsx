import type { PublicUser } from '../services/userService';

type Props = {
  users: PublicUser[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export function MemberPicker({ users, selectedIds, onChange }: Props) {
  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  if (users.length === 0) {
    return <p className="admin-muted admin-picker-empty">Add team members first on the Team page.</p>;
  }

  return (
    <ul className="member-picker-list">
      {users.map((u) => {
        const on = selectedIds.includes(u.id);
        return (
          <li key={u.id}>
            <label className="member-picker-item">
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggle(u.id)}
              />
              <span className="member-picker-avatar" aria-hidden />
              <span className="member-picker-text">
                <strong>{u.name}</strong>
                <span>{u.email}</span>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
