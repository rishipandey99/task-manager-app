import { api } from './api';

export type TaskUser = {
  _id: string;
  name: string;
  email: string;
};

export type Task = {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  progressDone?: number;
  progressTotal?: number;
  startDate?: string;
  dueDate?: string;
  createdAt?: string;
  user?: TaskUser;
  assignees?: TaskUser[];
};

export async function getTasks() {
  const res = await api.get('/api/tasks');
  return res.data as Task[];
}

export async function createTask(data: {
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  progressDone?: number;
  progressTotal?: number;
  startDate?: string;
  dueDate?: string;
  assignees?: string[];
}) {
  const res = await api.post('/api/tasks', data);
  return res.data as Task;
}

export async function updateTask(
  id: string,
  data: Partial<
    Pick<
      Task,
      | 'title'
      | 'description'
      | 'status'
      | 'priority'
      | 'progressDone'
      | 'progressTotal'
      | 'startDate'
      | 'dueDate'
    >
  > & { assignees?: string[] },
) {
  const res = await api.put(`/api/tasks/${id}`, data);
  return res.data as Task;
}

export async function deleteTask(id: string) {
  await api.delete(`/api/tasks/${id}`);
}
