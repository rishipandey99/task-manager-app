import type { Task } from '../services/taskService';

export function statusLabel(status: Task['status']) {
  if (status === 'completed') return 'Completed';
  if (status === 'in_progress') return 'In Progress';
  return 'Pending';
}

export function priorityLabel(p: Task['priority']) {
  if (p === 'high') return 'High';
  if (p === 'low') return 'Low';
  return 'Medium';
}

export function priorityTagLabel(p: Task['priority']) {
  if (p === 'high') return 'High Priority';
  if (p === 'low') return 'Low Priority';
  return 'Medium Priority';
}

export function formatTableDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatHeaderDate(d: Date) {
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'long' });
  const day = d.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
  const month = d.toLocaleDateString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  return `${weekday} ${day}${suffix} ${month} ${year}`;
}

export function greetingForHour(name: string, hour: number) {
  const g = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  return `${g}! ${name}`;
}
